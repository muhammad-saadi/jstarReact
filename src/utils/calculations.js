class Calculations {
  constructor() {
    // Physical constants
    this.Muo = 4 * Math.PI * 0.0000001;
    this.P_mass = 1.6726e-27;

    // Plant efficiency
    this.F_aux = 3;
    this.F_plant = 0.4;  // Based on modern coal/gas plants

    // Magnet slider variables
    this.i1min = 1;
    this.i2min = 1;
    this.i3min = 0.1;
    this.i4min = 0.1;
    this.i1max = 0.1;
    this.i2max = 0.1;
    this.i3max = 1.0;
    this.i4max = 1.0;

    // Field, power and fuel slider variables
    this.Bomin = 1;
    this.Bomax = 6;
    this.Boran = 80;
    this.Pwmin = 1;
    this.Pwmax = 100;
    this.Pwran = 80;
    this.Mdmin = 0.005;
    this.Mdmax = 0.4;
    this.Mdran = 80;

    // Initial dee calculation variables
    this.Rmax = 11;  // ITER EDA
    this.Rmin = 5;
    this.kMax = 1.8;
    this.k_o = this.kMax;
    this.Z_o = 0;
    this.zo = 0;
    this.d_min = 0.0;

    // Calculate initial geometry
    this.R_o = 0.5 * (this.Rmax + this.Rmin);
    this.a_o = 0.5 * (this.Rmax - this.Rmin);
    this.Vol_o = 2 * Math.PI * this.R_o * Math.PI * Math.pow(this.a_o, 2) * this.k_o;
    this.zMax = this.a_o * this.k_o;
    this.k_x = 0.4 * this.k_o + 0.6;

    // Nominal plasma design parameters
    this.Bo = 5.7;
    this.q_edg = 3.0;
    this.Troy_c = 2.5;
    this.t10o = 1.0;
    this.n20o = 1.2;
    this.IC_fac = 0.01;

    this.impurities = {
      He: 0.1,    // nAlp_ne
      O: 0.001,   // nO_ne
      C: 0.01048,   // nC_ne (initial value, will be rounded)
      Fe: 0.0001447, // nFe_ne (initial value, will be rounded)
      Be: 0.0,   // nBe_ne
      Ar: 0.0  // nAr_ne
    };

    // Impurity calculation parameters
    this.idZeff = 1;  // 1= O,C,Fe, 0= Be,Ar
    this.nAlp_ne = this.idZeff * 0.1;
    this.nO_ne = this.idZeff * 0.001;
    
    // Calculate nC_ne with proper rounding
    this.dum1 = this.idZeff * (0.009 + 0.006 * Math.pow(0.7 / this.n20o, 2.6));
    this.scale1 = Math.pow(10, Math.floor(Math.log10(Math.abs(this.dum1))) + 1 - 4);
    this.nC_ne = Math.round(this.dum1 / this.scale1) * this.scale1;

    // Calculate nFe_ne with proper rounding
    this.dum2 = this.idZeff * (0.0005 * Math.pow(0.7 / this.n20o, 2.3));
    this.scale2 = Math.pow(10, Math.floor(Math.log10(Math.abs(this.dum2))) + 1 - 4);
    this.nFe_ne = Math.round(this.dum2 / this.scale2) * this.scale2;

    this.nBe_ne = (1 - this.idZeff) * 0.02;
    this.nAr_ne = (1 - this.idZeff) * 0.0016;

    // Calculate full impurity composition
    this.nDT_ne = 1.0 - 2 * this.nAlp_ne - 4 * this.nBe_ne - 6 * this.nC_ne 
                  - 8 * this.nO_ne - 18 * this.nAr_ne - 26 * this.nFe_ne;
    this.nI_ne = this.nAlp_ne + this.nBe_ne + this.nC_ne + this.nO_ne 
                 + this.nAr_ne + this.nFe_ne + this.nDT_ne;
    this.Zeff = 1 + 2 * this.nAlp_ne + 4 * 3 * this.nBe_ne + 6 * 5 * this.nC_ne 
                + 8 * 7 * this.nO_ne + 18 * 17 * this.nAr_ne + 26 * 25 * this.nFe_ne;

    // Charge composition
    this.D_frac = 0.5;
    this.T_frac = 0.5;
    this.H_frac = 1.0 - this.D_frac - this.T_frac;
    this.m_den_chrg = this.P_mass * (2 * this.D_frac + 3 * this.T_frac + 4 * this.H_frac);
    this.m_den_n20 = this.m_den_chrg / 1e-20;

    // Plasma profile parameters
    this.Alp_t = 1.0;
    this.Alp_n = 0.5;
    this.f_an_at = Math.pow(1 + this.Alp_n, 2) * Math.pow(1 + 2 * this.Alp_n + 3 * this.Alp_t, 2) / Math.pow(1 + 2 * this.Alp_n + 2 * this.Alp_t, 3);
    this.T10c = ((1 + this.Alp_n) * (1 + 2 * this.Alp_n + 3 * this.Alp_t)) / ((1 + this.Alp_n + this.Alp_t) * (1 + 2 * this.Alp_n + 2 * this.Alp_t));

    // Time evolution parameters
    this.dt = 1;
    this.Time = 0;
    this.ittmax = 300;
    this.isCalculating = false;

    // Other initialization
    this.thread_flag = 0;
    this.mag = 1;
    this.h_mult = 1;

    this.doiterR8 = false;
    this.doiterR6 = false;
    
    // Add slider value tracking
    this.sv1 = 0;
    this.sv2 = 0;
    this.sv3 = 0;
    this.sv4 = 0;

    // Add plant type tracking
    this.plantType = 'ITER_R=8m';

    // Initialize results object
    this.results = {};
  }

  updateConfig(name, value) {
    switch (name) {
      case 'plantType':
        if (value === 'ITER_R=8m') {
          this.Rmax = 11;
          this.Rmin = 5;
          this.k_o = 1.8; // Done in ElongationOptions
          this.Mdmax = 0.4;
          
          if (this.doiterR8) { // ITER_R=8m Shape
            this.sv1 = 38; // 1=green OUTER sv1= 2*(20-19)
            this.sv2 = 36; // 2=red INNER sv2= 2*(20-18)
            this.sv3 = 35;      // 3=blue TOP/BOTTOM INNER sv3= 2*18
            this.sv4 = 23;      // 4=yellow TOP/BOTTOM OUTER sv4= 2*13
          }
          this.doiterR6 = true; // Enable R=6 geometry for next switch
        } else {
          this.Rmax = 8.4;
          this.Rmin = 4.0;
          this.Mdmax = 0.6;
          this.k_o = 2.1; // Done in ElongationOptions
          
          if (this.doiterR6) { // ITER_R=6m Shape
            this.sv1 = 20;  // 1=green OUTER
            this.sv2 = 20;  // 2=red INNER
            this.sv3 = 31;  // 3=blue TOP/BOTTOM INNER
            this.sv4 = 17;  // 4=yellow TOP/BOTTOM OUTER
          }
          this.doiterR8 = true; // Enable R=8 geometry for next switch
        }
        this.plantType = value;
        break;

      case 'confinement':
        this.h_mult = value === 'Standard' ? 1 : 2;
        break;

      case 'betaLimit':
        this.Troy_c = value === 'Standard' ? 2.5 : 5.0;
        break;

      case 'elongation':
        if (value === 'Standard') {
          this.k_o = this.plantType === 'ITER_R=8m' ? 1.8 : 2.1;
        } else {
          this.k_o = this.plantType === 'ITER_R=8m' ? 1.8 * 1.5 : 2.1 * 1.5;
        }
        this.kMax = this.k_o;
        break;
    }

    // Update dependent values
    this.R_o = 0.5 * (this.Rmax + this.Rmin);
    this.a_o = 0.5 * (this.Rmax - this.Rmin);
    this.Vol_o = 2 * Math.PI * this.R_o * Math.PI * Math.pow(this.a_o, 2) * this.k_o;
    this.zMax = this.a_o * this.k_o;
    this.k_x = 0.4 * this.k_o + 0.6;
    return {
      sliderValues: {
        sv1: this.sv1,
        sv2: this.sv2,
        sv3: this.sv3,
        sv4: this.sv4
      },
      needsUpdate: this.doiterR8 || this.doiterR6
    };
  
  }

  calculate(sliderValues, physicsValues) {
    const { sv1, sv2, sv3, sv4 } = sliderValues;
    const { boS, pwS, mdS } = physicsValues;

    // Calculate dee geometry
    this.calculateDeeGeometry(sv1, sv2, sv3, sv4);

    // Calculate input physics
    this.calculateInputPhysics(boS, pwS, mdS);

    // Main plasma calculations
    this.calculatePlasmaParameters();

    // Time evolution
    this.timeLoop();

    console.log('a', this.a);

    return {
      // Return all calculated values
      B_in: this.B_in,
      Ip_MA: this.Ip_MA,
      Pfus_MW: this.Pfus_MW,
      P_e: this.P_e,
      P_in_MW: this.P_in_MW,
      Conf_t: this.Conf_t,
      T10_: this.T10_,
      n_wall: this.n_wall,
      Bet: this.Bet,
      n20_n20_gw: this.n20_n20_gw,
      H98y2: this.H98y2,
      H89P: this.H89P,
      q_edg: this.q_edg,
      Zeff: this.Zeff,
      n_new: this.n_new,
      nDT_ne: this.nDT_ne,
      Pbrem_MW: this.Pbrem_MW,
      Ptrans_MW: this.Ptrans_MW,
      Vol: this.Vol,
      R_o: this.R_o,
      Z_o:this.Z_o,
k_o:this.k_o,      
      Ro: this.R1,
      Zo: 0,
      a: this.a,
      k: this.k,
      d: this.d,
      a_o: this.a_o,
      n20_n20_bet: this.n20_n20_bet,
      fdiv: this.fdiv,
      P_e_in: this.P_e_in,
    };
  }

  calculateDeeGeometry(sv1, sv2, sv3, sv4) {
    // Dee graph calculations
    this.i1 = ((this.i1max - this.i1min) / (2 * 20)) * sv1 + this.i1min;
    this.i2 = ((this.i2max - this.i2min) / (2 * 20)) * sv2 + this.i2min;
    this.i3 = ((this.i3max - this.i3min) / (2 * 20)) * sv4 + this.i3min;
    this.i4 = ((this.i4max - this.i4min) / (2 * 20)) * sv3 + this.i4min;
    
    this.R1 = this.R_o + (this.i2 - this.i1) * this.a_o * 0.9;
    this.a1 = Math.min(this.Rmax - this.R1, this.R1 - this.Rmin);
    this.k1 = 1 + 0.5 * (this.i3 + this.i4) * (this.kMax - 1);
    this.d1 = this.i4 - this.i3;

    this.f_k = (this.k1 - this.k_x) / (this.kMax - this.k_x);
    this.faMax = 0.5;
    this.f_i1pi2 = 0.5 * (this.i1 + this.i2);
    this.fa = this.faMax - this.faMax * this.f_i1pi2;
    this.f = 1 - this.f_k * this.fa;
    this.a2 = this.a1 * this.f;
    this.a3 = this.f_k < 0 ? this.a1 : this.a2;
  }

  calculateInputPhysics(boS, pwS, mdS) {
    console.log(boS+" "+pwS+" "+mdS)
    // Input physics calculations
    this.B_ino = this.Bomin + ((this.Bomax - this.Bomin) * boS / this.Boran);
    this.Pw_in_MWo = this.Pwmin + (this.Pwmax - this.Pwmin) * pwS / this.Pwran;
    this.mdot_V_fac = this.Mdmin + (this.Mdmax - this.Mdmin) * mdS / this.Mdran;
  }

  setImpurities(newImpurities) {
    this.impurities = { ...this.impurities, ...newImpurities };
    this.updateImpurities();
  }

  updateImpurities() {
    const { He, O, C, Fe, Be, Ar } = this.impurities;

    
    // Round C and Fe as in the Java code
    this.nC_ne = Math.round(C / Math.pow(10, Math.floor(Math.log10(C)) + 1 - 4)) * Math.pow(10, Math.floor(Math.log10(C)) + 1 - 4);
    this.nFe_ne = Math.round(Fe / Math.pow(10, Math.floor(Math.log10(Fe)) + 1 - 4)) * Math.pow(10, Math.floor(Math.log10(Fe)) + 1 - 4);

    this.nDT_ne = 1.0 - 2 * He - 4 * Be - 6 * this.nC_ne - 8 * O - 18 * Ar - 26 * this.nFe_ne;
    this.nI_ne = He + Be + this.nC_ne + O + Ar + this.nFe_ne + this.nDT_ne;
    this.Zeff = 1 + 2 * He + 4 * 3 * Be + 6 * 5 * this.nC_ne + 8 * 7 * O + 18 * 17 * Ar + 26 * 25 * this.nFe_ne;
  }

calculatePlasmaParameters() {
    // Set geometry based on magnet values
    this.Ro = this.mag <= 0 ? this.R_o : this.R1;
    this.a = this.mag <= 0 ? this.a_o * 0.95 : this.a3;
    this.k = this.mag <= 0 ? 0.0 : this.k1;
    this.d = this.mag <= 0 ? this.k_o : this.d1;

    // Calculate plasma parameters
    this.d_used = Math.max(this.d, this.d_min);
    this.Ro_a = this.Ro / this.a;
    this.Vol = 2 * Math.PI * this.Ro * Math.PI * Math.pow(this.a, 2) * this.k;
    this.Area = 4 * Math.pow(Math.PI, 2) * this.Ro * this.a * Math.sqrt(this.k);

    // Calculate plasma current
    this.I_B = 0.000001 * (1.17 - 0.065 / this.Ro_a / Math.pow((1 - 1 / Math.pow(this.Ro_a, 2)), 2)) *
               (2 * Math.PI * Math.pow(this.a, 2)) / (this.Muo * this.Ro * this.q_edg) *
               (1 + Math.pow(this.k, 2) * (1 + 2 * Math.pow(this.d_used, 2) - 1.2 * Math.pow(this.d_used, 3))) / 2;

    this.Ip_MAo = this.I_B * this.Bo;
    
    // Calculate q_star
    this.q_star = 5 * Math.pow(this.a, 2) * this.Bo / (this.Ro * this.Ip_MAo) *
                  (1 + Math.pow(this.k, 2) * (1 + 2 * Math.pow(this.d_used, 2) - 1.2 * Math.pow(this.d_used, 3))) / 2;
    
    // Calculate beta and density limits
    this.Bta_mxo = this.Troy_c * this.Ip_MAo / (100 * this.a * this.Bo);
    this.n20_gwo = 0.27 * this.Ip_MAo / Math.pow(this.a, 2);
    this.Betao = 0.402 * (1 + this.nI_ne) * this.n20o * this.t10o / Math.pow(this.Bo, 2);
    this.Beta_mrg = 1 - this.Betao / this.Bta_mxo;

    // Calculate mass and energy parameters
    this.M_toto = this.m_den_n20 * this.n20o * this.Vol_o;
    this.M_tot_Gro = this.M_toto / 0.001;
    this.W_den_MJo = 0.2403 * (1 + this.nI_ne) * this.n20o * this.t10o;
    this.W_MJo = this.W_den_MJo * this.Vol;
    
    // Calculate beta check
    this.Bta_chk = (this.W_den_MJo / 0.000001 / (Math.pow(this.Bo, 2) / (2 * this.Muo))) * 2 / 3;

    // Calculate geometry gaps
    this.gin = this.Ro - this.a - this.Rmin;
    this.got = this.Rmax - (this.Ro + this.a);
    this.gmin = Math.min(this.gin, this.got);
    this.gdiv = 0.05 * Math.pow(this.R_o / 8, 2);

    // Calculate divertor factor
    if (this.gmin <= 0) {
        this.fdiv = 0;
    } else if (this.gmin >= this.gdiv) {
        this.fdiv = 1;
    } else {
        this.fdiv = this.gmin / this.gdiv;
    }

    // Calculate H-factor and confinement time
    this.H_fac = this.h_mult * (this.fdiv + 1.0);
    this.Conf_to = this.H_fac * 0.048 * 
                   Math.pow(this.Ip_MAo, 0.85) *
                   Math.pow(this.Ro, 1.2) *
                   Math.pow(this.a, 0.3) *
                   Math.pow(this.n20o, 0.1) *
                   Math.pow(this.Bo, 0.2) *
                   Math.pow((2.5 * this.k / this.Pw_in_MWo), 0.5);

    // Calculate alpha heating factor
    if (this.t10o < this.T10c) {
        this.F_alpo = Math.pow(this.t10o / this.T10c, 3);
    } else if (this.t10o < 2 * this.T10c) {
        this.F_alpo = Math.pow(this.t10o / this.T10c, 2);
    } else if (this.t10o <= 3 * this.T10c) {
        this.F_alpo = 4 * Math.pow(this.t10o / (2 * this.T10c), 1.5);
    } else {
        this.F_alpo = 4 * Math.pow(1.5, 1.5);
    }

    // Calculate fusion power
    this.Pfus_d_MWo = 0.8 * this.f_an_at * Math.pow(this.nDT_ne, 2) * Math.pow(this.n20o, 2) * this.F_alpo;
    this.Pfus_MWo = this.Pfus_d_MWo * this.Vol;
    this.Palp_MWo = this.Pfus_MWo * 3.5 / 17.6;
    this.PNeut_MWo = this.Pfus_MWo - this.Palp_MWo;
    this.N_wal_load = this.PNeut_MWo / this.Area;

    // Time loop initialization
    this.dt = 1;
    this.Time = 0;

    // First state calculations
    this.P_in_MW = this.Pw_in_MWo;
    this.mdot_in = this.M_toto * this.mdot_V_fac;
    this.B_in = this.B_ino;
    this.n20_o = this.n20o * this.IC_fac;
    
    if (this.thread_flag === 0) {
        this.n20_ = this.n20_o;
    }
    
    this.W_MJ_o = this.W_MJo * this.IC_fac * this.IC_fac;
    
    if (this.thread_flag === 0) {
        this.W_MJ = this.W_MJ_o;
    }

    // Calculate temperature and related parameters
    this.T10_ = this.W_MJ / (0.2403 * (1 + this.nI_ne) * this.n20_ * this.Vol);
    this.T_c_mil = this.T10_ * 116.05;
    this.T_log10_c_mil = Math.log(this.T_c_mil) / Math.log(10);
    this.Ip_MA = this.B_in * this.I_B;

    // Calculate F_alp based on temperature
    if (this.T10_ < this.T10c) {
        this.F_alp = Math.pow(this.T10_ / this.T10c, 3);
    } else if (this.T10_ < 2 * this.T10c) {
        this.F_alp = Math.pow(this.T10_ / this.T10c, 2);
    } else if (this.T10_ < 3 * this.T10c) {
        this.F_alp = 4 * Math.pow(this.T10_ / (2 * this.T10c), 1.5);
    } else {
        this.F_alp = 4 * Math.pow(1.5, 1.5);
    }

    // Initialize power calculations
    this.Pfus_MW_m3 = 0.8 * this.f_an_at * Math.pow(this.nDT_ne, 2) * Math.pow(this.n20_, 2) * this.F_alp;
    this.Pfus_MW = this.Pfus_MW_m3 * this.Vol;
    this.Pfus_GW = this.Pfus_MW * 0.001;
    this.Palp_MW = this.Pfus_MW * 3.5 / 17.6;
    this.PNeut_MW = this.Pfus_MW - this.Palp_MW;
    this.Pgain_MW = this.P_in_MW + this.Palp_MW;

    // Calculate radiation and transport power
    this.Pbrem_MW = 0.0168 * this.n20_ * this.n20_ * this.Zeff * this.Vol * Math.pow(this.T10_, 0.5);
    this.Ptrans_MW = Math.max((this.Pgain_MW - this.Pbrem_MW), (0.5 * this.Pgain_MW));

    // Calculate confinement times
    this.tau_89 = 0.048 * Math.pow(this.Ip_MA, 0.85) * Math.pow(this.Ro, 1.2) * 
                  Math.pow(this.a, 0.3) * Math.pow(this.n20_, 0.1) * 
                  Math.pow(this.B_in, 0.2) * Math.pow(2.5 * this.k / this.Ptrans_MW, 0.5);

    this.tau_98 = 0.0562 * Math.pow(this.Ip_MA, 0.9) * Math.pow(this.B_in, 0.15) * 
                  Math.pow(this.Ptrans_MW, -0.69) * Math.pow((10 * this.n20_), 0.41) * 
                  Math.pow(2.5, 0.19) * Math.pow(this.Ro, 1.97) * 
                  Math.pow((this.Ro / this.a), -0.58) * Math.pow(this.k, 0.78);

    this.Conf_t = this.H_fac / 2.0 * this.tau_98;

    // Calculate H-factors
    this.H98y2 = this.Conf_t / this.tau_98;
    this.H89P = this.Conf_t / this.tau_89;

    // Power loss and density calculations
    this.Plos_MW = this.W_MJ / this.Conf_t;
    this.dW_MW_dt = this.Pgain_MW - this.Plos_MW;
    this.n20_in_rat = this.mdot_in / (0.000000418 * this.Vol);
    this.n20_los_rat = this.n20_ / this.Conf_t;
    this.dn20_dt = this.n20_in_rat - this.n20_los_rat;
    this.Mtot_Gr = this.n20_ * 0.418 * 0.000001 * this.Vol / 0.001;

    // Calculate density ratios
    this.n20_n20_gw = this.n20_ / (0.27 * this.Ip_MA / Math.pow(this.a, 2));
    this.n20_n20_bet = this.n20_ / (this.Troy_c * this.Ip_MA * this.B_in / 
                       (40.2 * (1 + this.nI_ne) * this.a * this.T10_));
    this.Bet = 0.402 * (1 + this.nI_ne) * this.n20_ * this.T10_ / Math.pow(this.B_in, 2);

    // Calculate wall loading and power
    this.n_wall = this.PNeut_MW / this.Area;
    this.P_e_in = this.P_in_MW * this.F_aux + this.B_in / this.Bo * 100;
    this.P_e_gross = this.PNeut_MW * this.F_plant;
    this.P_e = this.PNeut_MW * this.F_plant - this.P_e_in;

    // Calculate gain
    this.G = this.P_in_MW <= 0 ? 0 : this.Pfus_MW / this.P_in_MW;
}
timeLoop() {
    // Run for specified number of iterations
    for (let itt = 0; itt <= this.ittmax; itt++) {
        // Update input parameters
        this.P_in_MW = this.Pw_in_MWo;
        this.mdot_in = this.M_toto * this.mdot_V_fac;
        this.B_in = this.B_ino;

        // Update density
        this.n_new = this.n20_ + this.dn20_dt * this.dt;
        if (this.n_new <= 0.001 * this.n20_o) {
            this.n20_ = this.n20_o;
        } else {
            this.n20_ = this.n_new;
        }

        // Update energy
        this.W_new = this.W_MJ + this.dW_MW_dt * this.dt;
        if (this.W_new <= 0.001 * this.W_MJ_o) {
            this.W_MJ = this.W_MJ_o;
        } else {
            this.W_MJ = this.W_new;
        }

        // Calculate temperature
        this.T10_ = this.W_MJ / (0.2403 * (1 + this.nI_ne) * this.n20_ * this.Vol);
        this.T_c_mil = this.T10_ * 116.05;
        this.T_log10_c_mil = Math.log(this.T_c_mil) / Math.log(10);

        // Update plasma current
        this.Ip_MA = this.B_in * this.I_B;

        // Calculate alpha heating factor
        if (this.T10_ < this.T10c) {
            this.F_alp = Math.pow(this.T10_ / this.T10c, 3);
        } else if (this.T10_ < 2 * this.T10c) {
            this.F_alp = Math.pow(this.T10_ / this.T10c, 2);
        } else if (this.T10_ < 3 * this.T10c) {
            this.F_alp = 4 * Math.pow(this.T10_ / (2 * this.T10c), 1.5);
        } else {
            this.F_alp = 4 * Math.pow(1.5, 1.5);
        }

        // Calculate fusion power
        this.Pfus_MW_m3 = 0.8 * this.f_an_at * Math.pow(this.nDT_ne, 2) * 
                          Math.pow(this.n20_, 2) * this.F_alp;
        this.Pfus_MW = this.Pfus_MW_m3 * this.Vol;
        this.Pfus_GW = this.Pfus_MW * 0.001;
        this.Palp_MW = this.Pfus_MW * 3.5 / 17.6;
        this.PNeut_MW = this.Pfus_MW - this.Palp_MW;
        
        // Calculate power gain and losses
        this.Pgain_MW = this.P_in_MW + this.Palp_MW;
        this.Pbrem_MW = 0.0168 * this.n20_ * this.n20_ * this.Zeff * 
                        this.Vol * Math.pow(this.T10_, 0.5);
        
        // Calculate transport power
        this.Ptrans_MW = Math.max((this.Pgain_MW - this.Pbrem_MW), 
                                 (0.5 * this.Pgain_MW));

        // Calculate confinement times
        this.tau_89 = 0.048 * Math.pow(this.Ip_MA, 0.85) * 
                      Math.pow(this.Ro, 1.2) * 
                      Math.pow(this.a, 0.3) * 
                      Math.pow(this.n20_, 0.1) * 
                      Math.pow(this.B_in, 0.2) * 
                      Math.pow(2.5 * this.k / this.Ptrans_MW, 0.5);

        this.tau_98 = 0.0562 * Math.pow(this.Ip_MA, 0.9) * 
                      Math.pow(this.B_in, 0.15) * 
                      Math.pow(this.Ptrans_MW, -0.69) * 
                      Math.pow((10 * this.n20_), 0.41) * 
                      Math.pow(2.5, 0.19) * 
                      Math.pow(this.Ro, 1.97) * 
                      Math.pow((this.Ro / this.a), -0.58) * 
                      Math.pow(this.k, 0.78);

        // Calculate confinement time and H factors
        this.Conf_t = this.H_fac / 2.0 * this.tau_98;
        this.H98y2 = this.Conf_t / this.tau_98;
        this.H89P = this.Conf_t / this.tau_89;

        // Calculate power loss and energy rate of change
        this.Plos_MW = this.W_MJ / this.Conf_t;
        this.dW_MW_dt = this.Pgain_MW - this.Plos_MW;

        // Calculate particle rates
        this.n20_in_rat = this.mdot_in / (0.000000418 * this.Vol);
        this.n20_los_rat = this.n20_ / (1.0 * this.Conf_t);
        this.dn20_dt = this.n20_in_rat - this.n20_los_rat;

        // Calculate mass and density ratios
        this.Mtot_Gr = this.n20_ * 0.418 * 0.000001 * this.Vol / 0.001;
        this.n20_n20_gw = this.n20_ / (0.27 * this.Ip_MA / Math.pow(this.a, 2));
        this.n20_n20_bet = this.n20_ / (this.Troy_c * this.Ip_MA * this.B_in / 
                           (40.2 * (1 + this.nI_ne) * this.a * this.T10_));

        // Calculate beta
        this.Bet = 0.402 * (1 + this.nI_ne) * this.n20_ * this.T10_ / 
                   Math.pow(this.B_in, 2);

        // Calculate wall loading and power
        this.n_wall = this.PNeut_MW / this.Area;
        this.P_e_in = this.P_in_MW * this.F_aux + this.B_in / this.Bo * 100;
        this.P_e_gross = this.PNeut_MW * this.F_plant;
        this.P_e = this.PNeut_MW * this.F_plant - this.P_e_in;

        // Calculate Q (gain)
        if (this.P_in_MW <= 0) {
            this.G = 0;
        } else {
            this.G = this.Pfus_MW / this.P_in_MW;
        }

        // Update ColorIndex for DeeCanvas based on net electric power
        this.p_e_color_index = Math.floor(20.0 * this.P_e / 1000.0);
        this.p_e_color_index = Math.max(Math.min(20, this.p_e_color_index), 0);

        // Update progress bars
        this.updateProgressBars();
    }
}

updateProgressBars() {
    // These values are used by the UI components
    this.densityProgress = this.n20_n20_gw;
    this.pressureProgress = this.n20_n20_bet;
    this.boundaryProgress = 1 - this.fdiv;
}

updateAdvancedValues(values) {
  this.Bo_max = values.Bo_max;
  this.q95 = values.q95;
  this.kmax = values.kmax;

  // Update dependent values
  this.Bomax = this.Bo_max;
  this.q_edg = this.q95;
  this.kMax = this.kmax;
  this.k_o = this.kMax;  // Update k_o as well

  // Recalculate other dependent values
  this.updateConfigDependentValues();
}

}


export default Calculations;