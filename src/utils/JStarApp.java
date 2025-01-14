//=============================================================================
// Title:        JStarApp.java
// Version:      jStarApp13
// Author:       Jim Leuer
// Description:  Main program for JSstarApp
// Development:  eclipse
// JSstarApp MAIN class
// JSstarApp.java
// package jstarApp12;
// Dir: JimMac::/Users/leuer/Documents/computer/eclipse_ws1/JStarApp12/
// Mac/Terminal/Use:
//   cd /Users/leuer/Documents/computer/eclipse_ws1/JStarApp12/bin/
//   java jstarApp13
//=============================================================================
//  jstarApp13.java, Version 13 Modify jal 17sep2024 Update ITER_R=6
//=============================================================================

import java.awt.*;
import java.awt.event.*;
import java.util.EventListener;
import java.text.DecimalFormat;
import javax.swing.*;
import java.awt.Color;
import java.util.concurrent.CompletableFuture;

public class JStarApp extends Frame implements EventListener, ItemListener {

	private String title = "JStarApp13 J1.13: Fusion Power Plant Simulator JAL17Sep2024";

	private boolean isCalculating = false; // Used in “CompletableFuture”
	private boolean doiterR8 = false; // if true then ITER_R=8m geometry (Slider1-4) will be set
	private boolean doiterR6 = false; // if true then ITER_R=6m geometry (Slider1-4) will be set

	// magnet slider vars
	private double i1min = 1, i2min = 1, i3min = .1, i4min = .1;
	private double i1max = .1, i2max = .1, i3max = 1.0, i4max = 1.0;
	private double i1, i2, i3, i4;

	// field, power and fuel slider vars
	private double Bomin = 1, Bomax = 6, Boran = 80; // 20; //jal2024 Note must change 20=>81 below
	private double Pwmin = 1, Pwmax = 100, Pwran = 80; // 20;
	private double Mdmin = 0.005, Mdmax = 0.4, Mdran = 80; // 20;

	// initial dee calculation vars
	private double Rmax = 11, Rmin = 5; // ITER EDA
	// private double Rmax = 8.2, Rmin = 4.2; // ITER FEAT
	private double kMax = 1.8;
	private double k_o = kMax;
	private double Z_o = 0;
	private double zo = 0, d_min = 0.0; // Dont let d go negative
	private double faMax, f_k, f_i1pi2, fa, f;
	private double a2, a3;
	private double R_o = 0.5 * (Rmax + Rmin);
	private double a_o = 0.5 * (Rmax - Rmin);
	private double Vol_o = 2 * Math.PI * R_o * Math.PI * Math.pow(a_o, 2) * k_o;
	private double zMax = a_o * k_o;
	private double k_x = 0.4 * k_o + 0.6;

	// main plasma initialization design constants
	private double Muo = 4 * Math.PI * 0.0000001;

	// nominal plasma design parameters
	private double Bo = 5.7;
	private double q_edg = 3.0;
	private double Troy_c = 2.5;

	// nominal initial design temperature, density & mass change factor
	private double t10o = 1.0;
	private double n20o = 1.2;
	private double IC_fac = 0.01;

	// calculate nDT_ne, Zeff
	private int idZeff = 1; // 1= O,C,Fe, 0= Be,Ar
	private double nAlp_ne = idZeff * 0.1; // Helium ~ 0.05; //minimum =>Zeff=1.5
	private double nO_ne = idZeff * 0.001;
	private double dum1 = idZeff * (0.009 + 0.006 * Math.pow((0.7 / n20o), 2.6));
	double scale1 = Math.pow(10, Math.floor(Math.log10(Math.abs(dum1))) + 1 - 4);// 4digits
	double nC_ne = Math.round(dum1 / scale1) * scale1;// rounded to 4 digits

	private double dum2 = idZeff * (0.0005 * Math.pow((0.7 / n20o), 2.3));
	double scale2 = Math.pow(10, Math.floor(Math.log10(Math.abs(dum2))) + 1 - 4);// 4digits
	double nFe_ne = Math.round(dum2 / scale2) * scale2;// rounded to 4 digits
	private double nBe_ne = (1 - idZeff) * 0.02; // 2024
	private double nAr_ne = (1 - idZeff) * 0.0016; // 2024
	private double nDT_ne = 1.0 - 2 * nAlp_ne - 4 * nBe_ne - 6 * nC_ne - 8 * nO_ne - 18 * nAr_ne - 26 * nFe_ne;
	private double nI_ne = nAlp_ne + nBe_ne + nC_ne + nO_ne + nAr_ne + nFe_ne + nDT_ne;
	private double Zeff = 1 + 2 * nAlp_ne + 4 * 3 * nBe_ne + 6 * 5 * nC_ne + 8 * 7 * nO_ne + 18 * 17 * nAr_ne
			+ 26 * 25 * nFe_ne;

	// calculate charge info
	private double D_frac = 0.5;
	private double T_frac = 0.5;
	private double H_frac = 1.0 - D_frac - T_frac;
	private double P_mass = 1.6726E-27;
	private double m_den_chrg = P_mass * (2 * D_frac + 3 * T_frac + 4 * H_frac);
	private double m_den_n20 = m_den_chrg / 1E-20;

	// plasma profile info
	private double Alp_t = 1.0;
	private double Alp_n = 0.5;
	private double f_an_at = Math.pow((1 + Alp_n), 2) * Math.pow((1 + 2 * Alp_n + 3 * Alp_t), 2)
			/ Math.pow((1 + 2 * Alp_n + 2 * Alp_t), 3);
	private double T10c = ((1 + Alp_n) * (1 + 2 * Alp_n + 3 * Alp_t))
			/ ((1 + Alp_n + Alp_t) * (1 + 2 * Alp_n + 2 * Alp_t));

	// plant efficiancy info
	private double F_aux = 3;
	private double F_plant = 0.4; // old 0.3 2024 based on typical modern coal/gas plants

	private double d_used, Ro_a, Vol, Area;
	// plasma current, rational q_edge, major radius, minor radius, elongation
	private double I_B, Ro, a, k;
	// design current(MA), q_star, triangularity, optional geometyry flag *flag is
	// currently static*
	private double Ip_MAo, q_star, d, mag;
	// max beta from Troyon, Greenwald density limit, design beta from n20 + t10,
	// beta margin to Troyon
	private double Bta_mxo, n20_gwo, Betao, Beta_mrg;
	// design total mass, total mass, design energy density, design energy
	private double M_toto, M_tot_Gro, W_den_MJo, W_MJo;
	// Plasma to 1st wall Gaps: gmin Inner, g Inner, g Outer, g div
	private double gmin, gin, got, gdiv;
	// ???, confinement H-factor, design confinement time, check of beta
	private double fdiv, H_fac, Conf_to, Bta_chk, h_mult = 1;
	// design input power(MW), design input field, mass change out factor rate,
	// design fus power factor
	private double Pw_in_MWo, B_ino, mdot_V_fac, F_alpo;
	// desing fusion power density, design fusion power, design alpha power, design
	// neutron power
	private double Pfus_d_MWo, Pfus_MWo, Palp_MWo, PNeut_MWo;
	// delta Time, Time, Temp?, neutron wall loading(MW/m^2)
	private double dt, Time, T10, N_wal_load;
	// total energy, density(ne/10^20), temperature(T/10^20), ???
	private double W_MJ, n20_, T10_, T_c_mil;
	// Temp Million C?, input power, inout mass rate(kg/s), input magnetic field
	private double T_log10_c_mil, P_in_MW, mdot_in, B_in;
	// plasma current, fusion power temperature factor, fusion power density, fusion pow
	private double Ip_MA, F_alp, Pfus_MW_m3, Pfus_MW, Pfus_GW;
	// neutron power, total power gain, confinement time, alpha power, a few more
	// power variables
	private double PNeut_MW, Pgain_MW, Conf_t, Palp_MW, Ptrans_MW, Pbrem_MW, tau_89, tau_98;
	// power loss, total power, density input ratio
	private double Plos_MW, dW_MW_dt, n20_in_rat;
	// density loss ratio, ???, total mass, density rate
	private double n20_los_rat, d20_dt, Mtot_Gr, dn20_dt;
	// Neutron wall load, Injected Power, Gross Power, Troyon beta density ratio
	private double n_wall, P_e_in, P_e_gross, n20_n20_bet;
	// electric power generation, Gain?, Greenwald density ration, beta
	private double P_e, G, n20_n20_gw, Bet;
	// Updated Density, Updated energy, Inital/Stable Density, Intial/stable energy
	private double n_new, W_new, n20_o, W_MJ_o;
	// 0 to 100% for Mdot slider for print out
	private double mdot100;
	// colorIndex for deeCanvas: ratio of P_e to 1000MW and ratio'ed from 0 to 20
	private int p_e_color_index;

	// current magnet slider values
	private int sv1, sv2, sv3, sv4, sv5, sv6, thread_flag;
	// current dee parameters
	private double R1, z1, a1, k1, d1;
	// itteration parameters for new run()
	private int itt, ittmax = 100;

	// New Constants H98y2, H89P
	private double H98y2, H89P;

	// Input Physics SLiders: boS,pwS,mdS
	private double boS, pwS, mdS;

	// Needle Gauges for power in and out
	NeedleGauge PowerOutGauge = new NeedleGauge();
	NeedleGauge PowerInGauge = new NeedleGauge();
	NeedleGauge TemperatureGauge = new NeedleGauge();

	// Panel 1 which holds input sliders for B field, Power In, and Fuel
	Scrollbar BoSlider = new Scrollbar(0, 0, 1, 0, 81); // Boran+1.0); == Error? //jal2024
	Scrollbar PwSlider = new Scrollbar(0, 0, 1, 0, 81);
	Scrollbar MdSlider = new Scrollbar(0, 0, 1, 0, 81);
	Label p1Label = new Label("PLASMA INPUTS", 1);
	Label BoLabel = new Label();
	Label PwLabel = new Label();
	Label MdLabel = new Label();

	// Panel 2 which holds the dee graph and magnet sliders
	Scrollbar slider1 = new Scrollbar(1, 41, 1, 0, 41); // Slider1 = Green Slider
	Scrollbar slider2 = new Scrollbar(1, 41, 1, 0, 41); // Slider2 = Red Slider
	Scrollbar slider3 = new Scrollbar(0, 0, 1, 0, 41); // Slider3 = Slider5 = Blue Slider
	Scrollbar slider4 = new Scrollbar(0, 0, 1, 0, 41); // Slider4 = Slider6 = Yellow Slider
	Scrollbar slider5 = new Scrollbar(0, 0, 1, 0, 41); // Slider5 = Slider3 = Blue Slider
	Scrollbar slider6 = new Scrollbar(0, 0, 1, 0, 41); // Slider6 = Slider4 = Yellow Slider
	DeeCanvas deeCanvas = new DeeCanvas(R_o, Z_o, a_o, k_o, 0); // initialize dee for xmin,xmax,ymin

	// Panel 3 which holds the progress bars for density and pressure
	ProgressBar0 DensityProgress = new ProgressBar0();
	ProgressBar0 PressureProgress = new ProgressBar0();
	ProgressBar0 BoundaryProgress = new ProgressBar0();
	Label cLabel = new Label("PLASMA LIMITS", 1);
	Label dLabel = new Label(); // density
	Label pLabel = new Label(); // pressure
	Label bLabel = new Label("Diverted                       Limited ", 2); // boundary

	// Alternate Panel 4
	CheckboxGroup plantOptions = new CheckboxGroup();
	Checkbox iterEdaButton = new Checkbox("ITER_R=8m", plantOptions, true);
	Checkbox iterFeatButton = new Checkbox("ITER_R=6m", plantOptions, false);
	CheckboxGroup confinementOptions = new CheckboxGroup();
	Checkbox stdConfinement = new Checkbox("Standard", confinementOptions, true);
	Checkbox doubleConfinement = new Checkbox("Double", confinementOptions, false);
	CheckboxGroup betaLimitOptions = new CheckboxGroup();
	Checkbox stdBetaLimit = new Checkbox("Standard", betaLimitOptions, true);
	Checkbox doubleBetaLimit = new Checkbox("Double", betaLimitOptions, false);
	CheckboxGroup elongationOptions = new CheckboxGroup();
	Checkbox stdElongation = new Checkbox("Standard", elongationOptions, true);
	Checkbox increasedElongation = new Checkbox("50% Increase", elongationOptions, false);

	// Panel 5 which gives plant output information
	Label outputPanelLabel = new Label();
	Label fillerLabel = new Label();
	Label fieldOnAxisLabel = new Label();
	Label ipLabel = new Label();
	Label fusionPowerLabel = new Label();
	Label pinLabel = new Label();
	Label wallLoadLabel = new Label();
	Label QplasmaLabel = new Label();
	Label bnLabel = new Label();
	Label btLabel = new Label();
	Label nGRLabel = new Label();
	Label tauELabel = new Label();
	Label H98y2Label = new Label();
	Label H89PLabel = new Label();
	Label q95Label = new Label();
	Label ZeffLabel = new Label();
	Label temperatureLabel = new Label();
	Label densityLabel = new Label();

	Label nDT_neLabel = new Label(); // 2024
	Label PbremLabel = new Label(); // 2024
	Label PtransLabel = new Label(); // 2024
	Label VolLabel = new Label(); // 2024
	Label P_eLabel = new Label(); // 2024

	DecimalFormat intFormat = new DecimalFormat("0");
	DecimalFormat decFormat = new DecimalFormat("0.0");
	DecimalFormat densityFormat = new DecimalFormat("0.00");

	public static Image image;// protected AudioClip sound;

	private Panel controlRoom0 = new Panel();
	private Panel controlRoom = new Panel();

    //  New Panel to add fifth Panel
	private Panel controlRoomContainer = new Panel();

	private Color cbkgrd = Color.BLUE;

	private String st;
	private Insets inset = new Insets(5, 0, 5, 0);

	// ==============================================================================
	// Panel 1 Left Input Panel: controlRoom0 {tokInPanel (inputPanel,
	// gaugePanelIn)}
	// ==============================================================================
	public void getP1() {
		// create panel for the input and gauge panels
		Panel tokInPanel = new Panel();
		GridBagLayout gblTokIn = new GridBagLayout();
		GridBagConstraints constraintTokIn = new GridBagConstraints();
		tokInPanel.setLayout(gblTokIn);
		tokInPanel.setBackground(Color.lightGray);
		constraintTokIn.ipady = 10; // 32

		//// create input panel
		GridBagLayout gblInput = new GridBagLayout();
		GridBagConstraints constraintInput = new GridBagConstraints();
		Panel inputPanel = new Panel();
		inputPanel.setLayout(gblInput);
		inputPanel.setBackground(Color.gray);

		constraintInput.gridx = 0;
		constraintInput.gridy = 0;
		constraintInput.ipadx = 0;
		constraintInput.ipady = 2;
		constraintInput.gridwidth = 2;
		gblInput.setConstraints(p1Label, constraintInput);
		inputPanel.add(p1Label);

		constraintInput.gridwidth = 1;

		constraintInput.gridx = 0;
		constraintInput.gridy = 1;
		constraintInput.ipady = 5;
		constraintInput.ipadx = 100;
		constraintInput.insets = inset;
		gblInput.setConstraints(BoSlider, constraintInput);
		inputPanel.add(BoSlider);

		constraintInput.gridx = 0;
		constraintInput.gridy = 2;
		gblInput.setConstraints(PwSlider, constraintInput);
		inputPanel.add(PwSlider);

		constraintInput.gridx = 0;
		constraintInput.gridy = 3;
		gblInput.setConstraints(MdSlider, constraintInput);
		inputPanel.add(MdSlider);

		constraintInput.gridx = 1;
		constraintInput.gridy = 1;
		constraintInput.ipadx = 5;
		constraintInput.anchor = GridBagConstraints.WEST;
		gblInput.setConstraints(BoLabel, constraintInput);
		inputPanel.add(BoLabel);

		constraintInput.gridy = 2;
		gblInput.setConstraints(PwLabel, constraintInput);
		inputPanel.add(PwLabel);

		constraintInput.gridy = 3;
		gblInput.setConstraints(MdLabel, constraintInput);
		inputPanel.add(MdLabel);

		constraintTokIn.gridy = 0;
		gblTokIn.setConstraints(inputPanel, constraintTokIn);
		tokInPanel.add(inputPanel);

		//// create gauge panel
		Panel gaugePanelIn = new Panel();
		GridBagLayout gblGaugeIn = new GridBagLayout();
		GridBagConstraints constraintGaugeIn = new GridBagConstraints();
		gaugePanelIn.setLayout(gblGaugeIn);

		constraintGaugeIn.fill = 1;
		constraintGaugeIn.ipadx = 20;

		gblInput.setConstraints(PowerInGauge, constraintGaugeIn);
		gaugePanelIn.add(PowerInGauge);

		constraintTokIn.gridy = 1;
		gblTokIn.setConstraints(gaugePanelIn, constraintTokIn);
		tokInPanel.add(gaugePanelIn);

		////// set values for compnents
		PowerInGauge.setRaised(true);
		PowerInGauge.setLoVal(0);
		PowerInGauge.setHiVal(500);
		PowerInGauge.setValue(0);
		PowerInGauge.setLabel("Elec. Pow. In= " + PowerInGauge.getValue() + " MW");

		BoLabel.setText(" B Field = 0.00 Tesla ");// 2024
		PwLabel.setText(" Power   = 0.0  MW ");// 2024
		MdLabel.setText(" Fuel    = 0.0   % ");// 2024
		BoLabel.setAlignment(0);
		PwLabel.setAlignment(0);
		MdLabel.setAlignment(0);

		controlRoom0.add(tokInPanel);
	}

	// ==============================================================================
	// Panel 2 Middle Panel: controlRoom0
	// {deePanel(northPanel, deeCanvas, southPanel, slider1, slider2)}
	// ==============================================================================
	public void getP2() {

		GridBagConstraints constraintPanel = new GridBagConstraints();
		constraintPanel.ipadx = 30; // Old was 20
		GridBagLayout gblPanel = new GridBagLayout();

// NORTH PANEL
		Panel northPanel = new Panel();
		northPanel.setLayout(gblPanel);
		constraintPanel.anchor = GridBagConstraints.WEST;
		constraintPanel.insets.right = 0;// 48

		gblPanel.setConstraints(slider3, constraintPanel);
//    gblPanel.setConstraints(slider4,constraintPanel);
		northPanel.add(slider3);
		constraintPanel.insets.right = 0;

// SOUTH PANEL
		constraintPanel.insets.left = 0;// 48
		constraintPanel.anchor = GridBagConstraints.EAST;
		Panel southPanel = new Panel();
		southPanel.setLayout(gblPanel);
//    gblPanel.setConstraints(slider6,constraintPanel);
//    southPanel.add(slider6);
		gblPanel.setConstraints(slider4, constraintPanel); // 2024
		southPanel.add(slider4); // 2024

		Panel deePanel = new Panel();
		deePanel.setLayout(new BorderLayout());
		deePanel.add("North", northPanel);
		deePanel.add("West", slider2);
		deePanel.add("Center", deeCanvas);
		deePanel.add("East", slider1);
		deePanel.add("South", southPanel);

		deeCanvas.setColorIndex(0);
		slider1.setBackground(Color.green);
		slider2.setBackground(Color.red);
		slider3.setBackground(Color.blue);
		slider4.setBackground(Color.yellow);
		slider5.setBackground(Color.blue);
		slider6.setBackground(Color.yellow);
		deeCanvas.setGreen(20);
		deeCanvas.setRed(20);
		deeCanvas.setAll(R_o, Z_o, a_o, 1.1, 0); // initialize dee but with small elongation
		deeCanvas.setKo(k_o, a_o, R_o, Z_o, 0);

		controlRoom0.add(deePanel);
	}

	// ==============================================================================
	// Panel 3 Right output Panel: controlRoom0 {statsPanel(gaugePanelOut,
	// statusPanel)}
	// ==============================================================================
	public void getP3() {
		// panel 3 initialization (density and pressure progress)

		//// status panel holds the label and the status bars
		Panel statusPanel = new Panel();
		GridLayout gblStatus = new GridLayout();
		gblStatus.setRows(7);
		gblStatus.setColumns(1);
		statusPanel.setLayout(gblStatus);
		statusPanel.add(cLabel);
		statusPanel.add(DensityProgress);
		statusPanel.add(dLabel);
		statusPanel.add(PressureProgress);
		statusPanel.add(pLabel);
		statusPanel.add(BoundaryProgress);
		statusPanel.add(bLabel);

		//// gauge panel holds the power out and temperature gauges
		Panel gaugePanelOut = new Panel();
		BorderLayout gblGaugeOut = new BorderLayout();
		gblGaugeOut.setHgap(0);
		gaugePanelOut.setLayout(gblGaugeOut);
		gaugePanelOut.add("West", TemperatureGauge);
		gaugePanelOut.add("Center", PowerOutGauge);

		//// stats panel holds both the status and gauge panels
		Panel statsPanel = new Panel();
		BorderLayout gblStats = new BorderLayout();
		statsPanel.setLayout(gblStats);

		statsPanel.add("North", statusPanel);
		statsPanel.add("South", gaugePanelOut);

		gaugePanelOut.setBackground(Color.lightGray);
		statsPanel.setBackground(Color.gray);

		//// set values for components
		PowerOutGauge.setRaised(true);
		PowerOutGauge.setLoVal(-500);
		PowerOutGauge.setHiVal(1500);
		PowerOutGauge.setValue(0);
		PowerOutGauge.setLabel("Net Elec. Pow.= " + PowerOutGauge.getValue() + " MW");// 2024

		TemperatureGauge.setRaised(true);
		TemperatureGauge.setLoVal(0);
		TemperatureGauge.setHiVal(10);
		TemperatureGauge.setValue(0);
		TemperatureGauge.setLabel("Fusion Power= " + TemperatureGauge.getValue() + " GW");

		dLabel.setText(" ");
		pLabel.setText(" ");
		DensityProgress.updateBar(0);
		PressureProgress.updateBar(0);
		DensityProgress.setLabel("Density");
		PressureProgress.setLabel("Pressure");
		BoundaryProgress.setSmall(20); // jal2024 numbers >15 make red visible at 100%
		BoundaryProgress.setNumberColor90((float) 0.5);
		BoundaryProgress.setNumberColor100((float) 0.7);
		BoundaryProgress.updateBar(1);
		BoundaryProgress.setLabel("Boundary");
		BoundaryProgress.addText(" Limited"); // jal2024 Adds Limited to end of string

		controlRoom0.add(statsPanel);

	}

	// ==============================================================================
	// Panel 4 alternate implementation Bottom input Panel: controlRoom ITER EDA ||
	// ITER FEAT
	// ==============================================================================
	public void getP4() {
		// panel 4 initialization holds input fields for plasma specifications

		Panel plasmaPanel = new Panel();
		plasmaPanel.setLayout(new GridLayout(12, 0, 0, 0));
		plasmaPanel.setBackground(Color.gray);

		iterEdaButton.addItemListener(this);
		iterFeatButton.addItemListener(this);
		stdConfinement.addItemListener(this);
		doubleConfinement.addItemListener(this);
		stdBetaLimit.addItemListener(this);
		doubleBetaLimit.addItemListener(this);
		stdElongation.addItemListener(this);
		increasedElongation.addItemListener(this);

		Label plantLabel = new Label();
		Label confinementLabel = new Label();
		Label betaLimitLabel = new Label();
		Label elongationLabel = new Label();
		plantLabel.setText(" CONFIGURATION");
		confinementLabel.setText(" CONFINEMENT");
		betaLimitLabel.setText(" BETA LIMIT");
		elongationLabel.setText(" ELONGATION");

		plasmaPanel.add(plantLabel);
		plasmaPanel.add(iterEdaButton);
		plasmaPanel.add(iterFeatButton);
		plasmaPanel.add(confinementLabel);
		plasmaPanel.add(stdConfinement);
		plasmaPanel.add(doubleConfinement);
		plasmaPanel.add(betaLimitLabel);
		plasmaPanel.add(stdBetaLimit);
		plasmaPanel.add(doubleBetaLimit);
		plasmaPanel.add(elongationLabel);
		plasmaPanel.add(stdElongation);
		plasmaPanel.add(increasedElongation);

		controlRoom.add(plasmaPanel);
	}

	public Panel getP5() {
		Panel outputPanel = new Panel();
		outputPanel.setLayout(new GridLayout(5, 4));
		outputPanel.setBackground(Color.white);

		outputPanel.add(fieldOnAxisLabel);
		outputPanel.add(fusionPowerLabel);
		outputPanel.add(QplasmaLabel);
		outputPanel.add(bnLabel);

		outputPanel.add(ipLabel);
		outputPanel.add(P_eLabel);
		outputPanel.add(wallLoadLabel);
		outputPanel.add(H98y2Label);

		outputPanel.add(q95Label);
		outputPanel.add(pinLabel);
		outputPanel.add(btLabel);
		outputPanel.add(nGRLabel);

		outputPanel.add(ZeffLabel);
		outputPanel.add(PbremLabel);
		outputPanel.add(temperatureLabel);
		outputPanel.add(tauELabel);

		outputPanel.add(nDT_neLabel); // 2024
		outputPanel.add(PtransLabel);
		outputPanel.add(densityLabel);
		outputPanel.add(VolLabel);

		outputPanelLabel.setText(" PLANT OUTPUT INFO ");
		fillerLabel.setText(" ");
		fieldOnAxisLabel.setText(" Magnetic Field= ");
		ipLabel.setText(" Plasma Current= ");
		fusionPowerLabel.setText(" Fusion Power= ");
		pinLabel.setText(" Total Aux. Power= ");
		wallLoadLabel.setText(" Wall Load= ");
		QplasmaLabel.setText(" Q = Pfusion/Paux= ");
		bnLabel.setText(" Normalized Beta= ");
		btLabel.setText(" Toroidal Beta= ");
		nGRLabel.setText(" Greenwald Limit= ");
		tauELabel.setText(" Confinement Time= ");
		H98y2Label.setText(" H98y2= &  H89P= "); // 2024
		q95Label.setText(" Safety Factor, q95= ");
		ZeffLabel.setText(" Zeff= ");
		temperatureLabel.setText(" Temperature= ");
		densityLabel.setText(" Density= ");

		nDT_neLabel.setText(" DT Fraction= "); // 2024
		PbremLabel.setText(" Bremsstrahlung Rad.= ");
		PtransLabel.setText(" Transport Pow. Loss= ");
		VolLabel.setText(" Plasma Volume= ");
		P_eLabel.setText(" Net Elec. Pow.= ");

		return outputPanel;
	}

	public void getListeners() {
		// Add listener to green slider (slider1)
		slider1.addAdjustmentListener(new java.awt.event.AdjustmentListener() {
			// @Override
			public void adjustmentValueChanged(AdjustmentEvent e) {
				green_stateChanged(e);
			}
		});

		// Add listener to red slider (slider2)
		slider2.addAdjustmentListener(new java.awt.event.AdjustmentListener() {
			// @Override
			public void adjustmentValueChanged(AdjustmentEvent e) {
				red_stateChanged(e);
			}
		});

		// Add listener to blue slider (slider3)
		slider3.addAdjustmentListener(new java.awt.event.AdjustmentListener() {
			// @Override
			public void adjustmentValueChanged(AdjustmentEvent e) {
				blue_stateChanged(e, 1);
			}
		});

		// Add listener to yellow slider (slider4)
		slider4.addAdjustmentListener(new java.awt.event.AdjustmentListener() {
			// @Override
			public void adjustmentValueChanged(AdjustmentEvent e) {
				yellow_stateChanged(e, 1);
			}
		});

		// Add listener to blue slider (slider5)
		slider5.addAdjustmentListener(new java.awt.event.AdjustmentListener() {
			// @Override
			public void adjustmentValueChanged(AdjustmentEvent e) {
				blue_stateChanged(e, 2);
			}
		});

		// Add listener to yellow slider (slider6)
		slider6.addAdjustmentListener(new java.awt.event.AdjustmentListener() {
			// @Override
			public void adjustmentValueChanged(AdjustmentEvent e) {
				yellow_stateChanged(e, 2);
			}
		});

		// Add listener to BoSlider
		BoSlider.addAdjustmentListener(new java.awt.event.AdjustmentListener() {
			// @Override
			public void adjustmentValueChanged(AdjustmentEvent e) {
				Bo_stateChanged(e);
			}
		});

		// Add listener to PwSlider
		PwSlider.addAdjustmentListener(new java.awt.event.AdjustmentListener() {
			// @Override
			public void adjustmentValueChanged(AdjustmentEvent e) {
				Pw_stateChanged(e);
			}
		});

		// Add listener to MdSlider
		MdSlider.addAdjustmentListener(new java.awt.event.AdjustmentListener() {
			// @Override
			public void adjustmentValueChanged(AdjustmentEvent e) {
				Md_stateChanged(e);
			}
		});

	}

	// Radio Button Listener
//  @Override
	public void itemStateChanged(ItemEvent e) {
		String selected = plantOptions.getSelectedCheckbox().getLabel();
		if (selected.equals("ITER_R=8m")) {
			Rmax = 11;
			Rmin = 5;
			k_o = 1.8; // 2024 Done in ElongationOptions
			Mdmax = 0.4;
			if (doiterR8) { // ITER_R=8m Shape)
				sv1 = 40 - 38;
				slider1.setValue(sv1); // 1=green OUTER sv1= 2*(20-19)
				sv2 = 40 - 36;
				slider2.setValue(sv2); // 2=red INNER sv2= 2*(20-18);
				sv3 = 35;
				slider3.setValue(sv3); // 3=blue TOP/BOTTOM INNER sv3= 2*18;
				sv4 = 23;
				slider4.setValue(sv4); // 4=yellow TOP/BOTTOM OUTER sv4= 2*13;
			}
			doiterR6 = true; // If ITER_R=8 button pushed allow next ITER_R=6 button to put in R=6 geometry
		} else {
			Rmax = 8.4;
			Rmin = 4.0;
			Mdmax = 0.6;
			k_o = 2.1; // 2024 Done in ElongationOptions
			if (doiterR6) { // ITER_R=6m Shape)
				sv1 = 20; //jal17sep2024
				slider1.setValue(sv1); // 1=green OUTER sv1= 2*(20-19)
				sv2 = 20;
				slider2.setValue(sv2); // 2=red INNER sv2= 2*(20-18);
				sv3 = 31; // 34;//jal17sep2024
				slider3.setValue(sv3); // 3=blue TOP/BOTTOM INNER sv3= 2*18;
				sv4 = 17; // 14;//jal17sep2024
				slider4.setValue(sv4); // 4=yellow TOP/BOTTOM OUTER sv4= 2*13;
			}

			doiterR8 = true; // If ITER_R=6 button pushed allow next ITER_R=8 button to put in R=8 geometry
		}

		selected = confinementOptions.getSelectedCheckbox().getLabel();
		if (selected.equals("Standard")) {
			h_mult = 1;
		} else {
			h_mult = 2;
		}

		selected = betaLimitOptions.getSelectedCheckbox().getLabel();
		if (selected.equals("Standard")) {
			Troy_c = 2.5;
		} else {
			Troy_c = 5.0;
		}

		selected = elongationOptions.getSelectedCheckbox().getLabel();
		if (selected.equals("Standard")) {
			selected = plantOptions.getSelectedCheckbox().getLabel();
			if (selected.equals("ITER_R=8m")) {
				k_o = 1.8;
			} else {
				k_o = 2.1;
			}
		} else {
			selected = plantOptions.getSelectedCheckbox().getLabel();
			if (selected.equals("ITER_R=8m")) {
				k_o = 1.8 * 1.5;
			} else {
				k_o = 2.1 * 1.5;
			}
		}

		// recalculate with new values of Rmax, Rmin, k_o
		R_o = 0.5 * (Rmax + Rmin);
		a_o = 0.5 * (Rmax - Rmin);
		Vol_o = 2 * Math.PI * R_o * Math.PI * Math.pow(a_o, 2) * k_o;
		zMax = a_o * k_o;
		k_x = 0.4 * k_o + 0.6;
		kMax = k_o;
		deeCanvas.setAll(R_o, Z_o, a_o, 1.1, 0);
		deeCanvas.setMinMax(R_o, Z_o, a_o, 1.1, 0);
		deeCanvas.setKo(k_o, a_o, R_o, Z_o, 0);
		calculate();
	}

//  Add state (adjustment value) change event to green slider
	void green_stateChanged(AdjustmentEvent e) {
		sv1 = slider1.getValue();
		deeCanvas.setGreen(sv1);
		calculate();
	}

//  Add state (adjustment value) change event to red slider
	void red_stateChanged(AdjustmentEvent e) {
		sv2 = slider2.getValue();
		deeCanvas.setRed(sv2);
		calculate();
	}

//  Add state (adjustment value) change event to blue sliders
	void blue_stateChanged(AdjustmentEvent e, int flag) {
		if (flag == 1) {
			sv3 = slider3.getValue();
			slider5.setValue(sv3);
		} else if (flag == 2) {
			sv5 = slider5.getValue();
			slider3.setValue(sv5);
			sv3 = slider3.getValue();
		}
		deeCanvas.setBlue(sv3);
		flag = 0;
		calculate();
	}

//  Add state (adjustment value) change event to yellow sliders
	void yellow_stateChanged(AdjustmentEvent e, int flag) {
		if (flag == 1) {
			sv4 = slider4.getValue();
			slider6.setValue(sv4);
		} else if (flag == 2) {
			sv6 = slider6.getValue();
			slider4.setValue(sv6);
			sv4 = slider4.getValue();
		}
		deeCanvas.setYellow(sv4);
		flag = 0;
		calculate();
	}

//  Add state (adjustment value) change event to BoSlider
	void Bo_stateChanged(AdjustmentEvent e) {
		calculate();
	}

//  Add state (adjustment value) change event to PwSlider
	void Pw_stateChanged(AdjustmentEvent e) {
		calculate();
	}

//  Add state (adjustment value) change event to MdSlider
	void Md_stateChanged(AdjustmentEvent e) {
		calculate();
	}

///////////////////////////////////////////////////////////////////////////
//-------------------------------- JStarApp() -----------------------------
	public JStarApp() {
		super("JStarApp");

		addWindowListener(new WindowAdapter() {
			public void windowClosing(WindowEvent we) {
				System.exit(0);
			}
		});

		System.out.println("nC_ne, rounded " + (float) dum1 + "  " + (float) nC_ne);
		System.out.println("nFe_ne, rounded " + (float) dum2 + "  " + (float) nFe_ne);

		thread_flag = 0;

		setTitle(title);

		// Get Parameters
		Rmax = 11.0;
		Rmin = 5.0;

		// recalculate with new values of Rmax, Rmin, k_o
		R_o = 0.5 * (Rmax + Rmin);
		a_o = 0.5 * (Rmax - Rmin);
		Vol_o = 2 * Math.PI * R_o * Math.PI * Math.pow(a_o, 2) * k_o;
		zMax = a_o * k_o;
		k_x = 0.4 * k_o + 0.6;

		deeCanvas.setAll(R_o, Z_o, a_o, 1.1, 0);
		deeCanvas.setKo(k_o, a_o, R_o, Z_o, 0);

		setBackground(cbkgrd);
		controlRoom0.setLayout(new FlowLayout());
		controlRoom.setLayout(new FlowLayout());

		getP4(); // controlRoom
		getP1(); // controlRoom0
		getP2(); // controlRoom0
		getP3(); // controlRoom0

//======================================================================
// impPanel Impurity Panel (new)
//======================================================================
		Panel impPanel = new Panel();
		impPanel.setVisible(false);
		impPanel.setBackground(Color.BLUE); // Set background color to blue

		Label impL1 = new Label("He%=", 1);
		impL1.setForeground(Color.WHITE);
		impL1.setBackground(Color.BLUE);
		impL1.setFont(new Font("Verdana", Font.PLAIN, 16));
		impPanel.add(impL1);
		TextField impF1 = new TextField(6);
		impF1.setText(String.valueOf(100 * nAlp_ne));
		impF1.setForeground(Color.BLACK);
		impPanel.add(impF1);

		Label impL2 = new Label("O%=", 1);
		impL2.setForeground(Color.WHITE);
		impL2.setBackground(Color.BLUE);
		impL2.setFont(new Font("Verdana", Font.PLAIN, 16));
		impPanel.add(impL2);
		TextField impF2 = new TextField(6);
		impF2.setText(String.valueOf(100 * nO_ne));
		impF2.setForeground(Color.BLACK);
		impPanel.add(impF2);

		Label impL3 = new Label("C%=", 1);
		impL3.setForeground(Color.WHITE);
		impL3.setBackground(Color.BLUE);
		impL3.setFont(new Font("Verdana", Font.PLAIN, 16));
		impPanel.add(impL3);
		TextField impF3 = new TextField(6);
		impF3.setText(String.valueOf(100 * nC_ne));
		impF3.setForeground(Color.BLACK);
		impPanel.add(impF3);

		Label impL4 = new Label("Fe%=", 1);
		impL4.setForeground(Color.WHITE);
		impL4.setBackground(Color.BLUE);
		impL4.setFont(new Font("Verdana", Font.PLAIN, 16));
		impPanel.add(impL4);
		TextField impF4 = new TextField(7);
		impF4.setText(String.valueOf(100 * nFe_ne));
		impF4.setForeground(Color.BLACK);
		impPanel.add(impF4);

		Label impL5 = new Label("Be%=", 1);
		impL5.setForeground(Color.WHITE);
		impL5.setBackground(Color.BLUE);
		impL5.setFont(new Font("Verdana", Font.PLAIN, 16));
		impPanel.add(impL5);
		TextField impF5 = new TextField(6);
		impF5.setText(String.valueOf(100 * nBe_ne));
		impF5.setForeground(Color.BLACK);
		impPanel.add(impF5);

		Label impL6 = new Label("Ar%=", 1);
		impL6.setForeground(Color.WHITE);
		impL6.setBackground(Color.BLUE);
		impL6.setFont(new Font("Verdana", Font.PLAIN, 16));
		impPanel.add(impL6);
		TextField impF6 = new TextField(6);
		impF6.setText(String.valueOf(100 * nAr_ne));
		impF6.setForeground(Color.BLACK);
		impPanel.add(impF6);

//   impPanel.add(impSButton);
		Button impSButton = new Button("Save");
		impSButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				try {
					nAlp_ne = 0.01 * Double.parseDouble(impF1.getText());
					nO_ne = 0.01 * Double.parseDouble(impF2.getText());
					nC_ne = 0.01 * Double.parseDouble(impF3.getText());
					nFe_ne = 0.01 * Double.parseDouble(impF4.getText());
					nBe_ne = 0.01 * Double.parseDouble(impF5.getText());
					nAr_ne = 0.01 * Double.parseDouble(impF6.getText());
					nDT_ne = 1.0 - 2 * nAlp_ne - 4 * nBe_ne - 6 * nC_ne - 8 * nO_ne - 18 * nAr_ne - 26 * nFe_ne;
					nI_ne = nAlp_ne + nBe_ne + nC_ne + nO_ne + nAr_ne + nFe_ne + nDT_ne;
					Zeff = 1 + 2 * nAlp_ne + 4 * 3 * nBe_ne + 6 * 5 * nC_ne + 8 * 7 * nO_ne + 18 * 17 * nAr_ne
							+ 26 * 25 * nFe_ne;
					calculate(); //
				} catch (NumberFormatException e1) {
					System.out.println("Please enter valid decimal numbers.");
				}
			}
		});
		impPanel.add(impSButton);

		// impPanel.add(impCloseButton);
		Button impCloseButton = new Button("Close");
		impCloseButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				impPanel.setVisible(false);
			}
		});
		impPanel.add(impCloseButton);

//======================================================================
// popupPanel Bo_max, q95, kmax, impButton, saveButton, closeButton
//======================================================================
		Panel popupPanel = new Panel();

		popupPanel.setVisible(false);
		popupPanel.setBackground(Color.BLUE); // Set background color to blue

		Label tf1Label1 = new Label("Bo_max=", 1);
		tf1Label1.setForeground(Color.WHITE);
		tf1Label1.setBackground(Color.BLUE);
		tf1Label1.setFont(new Font("Verdana", Font.PLAIN, 16));
		popupPanel.add(tf1Label1);
		TextField textField1 = new TextField(6);
		textField1.setText(String.valueOf(Bomax));
		textField1.setForeground(Color.BLACK);
		popupPanel.add(textField1);

		Label tf1Label2 = new Label("q95=", 1);
		tf1Label2.setForeground(Color.WHITE);
		tf1Label2.setBackground(Color.BLUE);
		tf1Label2.setFont(new Font("Verdana", Font.PLAIN, 16));
		popupPanel.add(tf1Label2);
		TextField textField2 = new TextField(6);
		textField2.setText(String.valueOf(q_edg));
		textField2.setForeground(Color.BLACK);
		popupPanel.add(textField2);

		Label tf1Label3 = new Label("kmax=", 1);
		tf1Label3.setForeground(Color.WHITE);
		tf1Label3.setBackground(Color.BLUE);
		tf1Label3.setFont(new Font("Verdana", Font.PLAIN, 16));
		popupPanel.add(tf1Label3);
		TextField textField3 = new TextField(6);
		textField3.setText(String.valueOf(k_o));
		textField3.setForeground(Color.BLACK);
		popupPanel.add(textField3);

//   popupPanel.add(impButton);
		Button impButton = new Button("Impurities");
		impButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				System.out.println("inpurityButton clicked: impPanel");
				popupPanel.setVisible(false);
				impPanel.setVisible(true);
				controlRoomContainer.add("South", impPanel);
				impF1.setText(String.valueOf(100 * nAlp_ne));
				impF2.setText(String.valueOf(100 * nO_ne));
				impF3.setText(String.valueOf(100 * nC_ne));
				impF4.setText(String.valueOf(100 * nFe_ne));
				impF5.setText(String.valueOf(100 * nBe_ne));
				impF6.setText(String.valueOf(100 * nAr_ne));
				controlRoomContainer.validate(); // update controlRoomContainer
				validate(); // update Frame
				setSize(973, 440);// 2024
			}
		});
		popupPanel.add(impButton);

		Button saveButton = new Button("Save");
		saveButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				try {
					double number1 = Double.parseDouble(textField1.getText());
					double number2 = Double.parseDouble(textField2.getText());
					double number3 = Double.parseDouble(textField3.getText());
					Bomax = number1;
					q_edg = number2;
					k_o = number3;
					kMax = k_o;
					calculate(); //
				} catch (NumberFormatException e1) {
					System.out.println("Please enter valid decimal numbers.");
				}
			}
		});
		popupPanel.add(saveButton);

		Button closeButton = new Button("Close");
		closeButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				popupPanel.setVisible(false);
			}
		});
		popupPanel.add(closeButton);

//======================================================================
// controlRoom.add(titlePanel);
		if (false) {
			controlRoom.add(controlRoom0);
		} else {
			Panel titlePanel = new Panel();
			titlePanel.setLayout(new BoxLayout(titlePanel, BoxLayout.Y_AXIS));
			Button titleButton = new Button(" JStarAPP");
			titleButton.addActionListener(new ActionListener() {
				public void actionPerformed(ActionEvent e) {
					System.out.println("titleButton clicked popupPanel");
					popupPanel.setVisible(true);
					controlRoomContainer.add("South", popupPanel);
					textField1.setText(String.valueOf(Bomax));
					textField2.setText(String.valueOf(q_edg));
					textField3.setText(String.valueOf(k_o));
					controlRoomContainer.validate(); // update controlRoomContainer
					validate(); // update Frame
					setSize(973, 440);// 2024
				}
			});
			titleButton.setFont(new Font("Arial", Font.PLAIN, 16));
			titlePanel.add(titleButton);
			titlePanel.add(controlRoom0);
			controlRoom.add(titlePanel);
		}

//======================================================================
// 5th Panel: getP5()    
		Panel outputPanel = getP5();

//  adding fifth panel using borderLayout
		if (true) {
			BorderLayout controlRoomLayout = new BorderLayout();
			controlRoomContainer.setLayout(controlRoomLayout);

			controlRoomContainer.add("North", controlRoom);
			controlRoomContainer.add("Center", outputPanel);

			Panel rectangle1 = new Panel();
			rectangle1.setBackground(Color.BLUE); // Set background color to blue
			controlRoomContainer.add("West", rectangle1);

			Panel rectangle2 = new Panel();
			rectangle2.setBackground(Color.BLUE); // Set background color to blue
			controlRoomContainer.add("East", rectangle2);

			Panel rectangle = new Panel();
			rectangle.setBackground(Color.BLUE); // Set background color to blue
			rectangle.setMinimumSize(new Dimension(100, 50));
			controlRoomContainer.add("South", rectangle);
		}

//======================================================================
		this.add("Center", controlRoomContainer); // adds controlRoomContainer to frame
		this.setSize(973, 410);// 2024
		this.setVisible(true); // if popup false then doesnt add popup

		getListeners();

		if (true) { // NO SHAPE DEFAULT (2* doubles 20 resolution to 40)
			sv1 = 2 * 20;
			slider1.setValue(sv1); // 1=green OUTER
			sv2 = 2 * 20;
			slider2.setValue(sv2); // 2=red INNER
			sv3 = 0;
			slider3.setValue(sv3); // 3=blue TOP/BOTTOM INNER
			sv4 = 0;
			slider4.setValue(sv4); // 4=yellow TOP/BOTTOM OUTER
		} else {// shape: ITER98= ITER_R=8m
			sv1 = 40 - 38;
			slider1.setValue(sv1); // 1=green OUTER
			sv2 = 40 - 36;
			slider2.setValue(sv2); // 2=red INNER
			sv3 = 35;
			slider3.setValue(sv3); // 3=blue TOP/BOTTOM INNER
			sv4 = 23;
			slider4.setValue(sv4); // 4=yellow TOP/BOTTOM OUTER
		}
//    System.out.println();
//    System.out.println("slider1= " + (float) slider1.getValue() );
		calculate(); // Must Initialize calculations for all numbers to be seen on startup
		popupPanel.setVisible(false);
	}

//------------------ calculate -----------------------------
// Input: slider values (sv1...sv4) from Dee Magnet, Internally gets Bo,Pw,MdSlider values

	void calculate() {
		// Slider Values to generate: R1,a1,k1,d1 => Ro,a,k,d
		sv1 = slider1.getValue(); // get slider1 values 1=green OUTER
		sv2 = slider2.getValue(); // get slider2 values 2=red INNER
		sv3 = slider3.getValue(); // get slider3 values 3=blue TOP/BOTTOM INNER
		sv4 = slider4.getValue(); // get slider4 values 4=yellow TOP/BOTTOM OUTER
//    System.out.println();
//    System.out.println("sv1= " + (float) sv1 );
		// Input Physics Sliders: BoSlider, PwSlider, MdSlider => boS,pwS,mdS
		boS = BoSlider.getValue();
		pwS = PwSlider.getValue();
		mdS = MdSlider.getValue();

		// Dee graph calc ( 2* increases resolution to 40 )
		i1 = (((i1max - i1min) / (2 * 20)) * sv2) + i1min; // red
		i2 = (((i2max - i2min) / (2 * 20)) * sv1) + i2min; // green
		i3 = (((i3max - i3min) / (2 * 20)) * sv4) + i3min; // yellow
		i4 = (((i4max - i4min) / (2 * 20)) * sv3) + i4min; // blue
		R1 = R_o + (i2 - i1) * a_o * .9;
		a1 = Math.min(Rmax - R1, R1 - Rmin);
		k1 = 1 + 0.5 * (i3 + i4) * (kMax - 1);
		d1 = i4 - i3;
//    System.out.println("k_o,k1,d1= " + (float) k_o + ", " + (float) k1 + ", " +  (float) d1 );
		f_k = (k1 - k_x) / (kMax - k_x);
		faMax = .5;
		f_i1pi2 = .5 * (i1 + i2);
		fa = faMax - faMax * f_i1pi2;
		f = 1 - f_k * fa;
		a2 = a1 * f;
		if (f_k < 0) {
			a3 = a1;
		} else {
			a3 = a2;
		}
		deeCanvas.setAll(R1, 0, a3, k1, d1);
		deeCanvas.setGreen(sv1);
		deeCanvas.setRed(sv2);
		deeCanvas.setBlue(sv3);
		deeCanvas.setYellow(sv4);

		// Input for B Field, Power, Fuel (New Input: boS,pwS,mdS)
		B_ino = Bomin + ((Bomax - Bomin) * boS / Boran); // new using boS
		Pw_in_MWo = Pwmin + (Pwmax - Pwmin) * pwS / Pwran;
		mdot_V_fac = Mdmin + (Mdmax - Mdmin) * mdS / Mdran;

		st = String.valueOf(B_ino);
		if (st.length() <= 3)
			st = st + "0";// 2024
		st = st.substring(0, 4);// 2024
		BoLabel.setText(" B Field = " + st + " Tesla ");

		st = String.valueOf(Pw_in_MWo);
		st = st.substring(0, 3);
		PwLabel.setText(" Power  = " + st + " MW ");

		mdot100 = 100.0 * MdSlider.getValue() / Mdran;
		st = String.valueOf(mdot100);
		st = st.substring(0, 3);
		MdLabel.setText(" Fuel     =  " + st + " % ");

		mag = 1;
		if (mag <= 0) {
			Ro = R_o;
		} else {
			Ro = R1;
		}
		if (mag <= 0) {
			a = a_o * 0.95;
		} else {
			a = a3;
		}
		if (mag <= 0) {
			k = 0.0;
		} else {
			k = k1;
		}
		if (mag <= 0) {
			d = k_o;
		} else {
			d = d1;
		}
//    System.out.println("k= " + (float) k );

		// start calculation of main design plasma parameters
		d_used = Math.max(d, d_min); // Dont let d go negative
		Ro_a = Ro / a;
		Vol = 2 * Math.PI * Ro * Math.PI * Math.pow(a, 2) * k;
		Area = 4 * Math.pow(Math.PI, 2) * Ro * a * Math.sqrt(k);
		I_B = 0.000001 * (1.17 - 0.065 / Ro_a / Math.pow((1 - 1 / Math.pow(Ro_a, 2)), 2))
				* (2 * Math.PI * Math.pow(a, 2)) / (Muo * Ro * q_edg)
				* (1 + Math.pow(k, 2) * (1 + 2 * Math.pow(d_used, 2) - 1.2 * Math.pow(d_used, 3))) / 2;
		Ip_MAo = I_B * Bo;
		q_star = 5 * Math.pow(a, 2) * Bo / (Ro * Ip_MAo)
				* (1 + Math.pow(k, 2) * (1 + 2 * Math.pow(d_used, 2) - 1.2 * Math.pow(d_used, 3))) / 2;
		Bta_mxo = Troy_c * Ip_MAo / (100 * a * Bo);
		n20_gwo = 0.27 * Ip_MAo / Math.pow(a, 2);
		Betao = 0.402 * (1 + nI_ne) * n20o * t10o / Math.pow(Bo, 2);
		Beta_mrg = 1 - Betao / Bta_mxo; // Beta Margin
		M_toto = m_den_n20 * n20o * Vol_o; // Initial guess Volume based BIG Rmax,Rmin & ko 
										   // to remove Volume variation with shape change?
		M_tot_Gro = M_toto / 0.001;
		W_den_MJo = 0.2403 * (1 + nI_ne) * n20o * t10o;
		W_MJo = W_den_MJo * Vol;
		Bta_chk = W_den_MJo / 0.000001 / (Math.pow(Bo, 2) / (2 * Muo)) * 2 / 3;
		gin = Ro - a - Rmin;
		got = Rmax - (Ro + a);
		gmin = Math.min(gin, got);
		gdiv = 0.05 * Math.pow(R_o / 8, 2); // 10cm is to large, try 5cm jal2024
		if (gmin <= 0) {
			fdiv = 0;
		} else if (gmin >= gdiv) {
			fdiv = 1;
		} else {
			fdiv = gmin / gdiv;
		}

		if (fdiv <= 0.3) {
			deeCanvas.changeGraphColor(0);
		} else {
			deeCanvas.changeGraphColor(1);
		}

		BoundaryProgress.updateBar((float) (1 - fdiv));
		H_fac = h_mult * (fdiv + 1.0);
		Conf_to = H_fac * 0.048 * Math.pow(Ip_MAo, 0.85) * Math.pow(Ro, 1.2) * Math.pow(a, 0.3) * Math.pow(n20o, 0.1)
				* Math.pow(Bo, 0.2) * Math.pow((2.5 * k / Pw_in_MWo), 0.5);
		if (t10o < T10c) {
			F_alpo = Math.pow(t10o / T10c, 3);
		} else if (t10o < 2 * T10c) {
			F_alpo = Math.pow(t10o / T10c, 2);
		} else if (t10o <= 3 * T10c) {
			F_alpo = 4 * Math.pow(t10o / 2 * T10c, 1.5);
		} else {
			F_alpo = 4 * Math.pow(1.5, 1.5);
		}
		Pfus_d_MWo = 0.8 * f_an_at * Math.pow(nDT_ne, 2) * Math.pow(n20o, 2) * F_alpo;
		Pfus_MWo = Pfus_d_MWo * Vol;
		Palp_MWo = Pfus_MWo * 3.5 / 17.6;
		PNeut_MWo = Pfus_MWo - Palp_MWo;
		N_wal_load = PNeut_MWo / Area;
		dt = 1;
		Time = 0;

		// time loop one (first state)
		P_in_MW = Pw_in_MWo;
		mdot_in = M_toto * mdot_V_fac;
		B_in = B_ino;
		n20_o = n20o * IC_fac;
		if (thread_flag == 0) {
			n20_ = n20_o;
		}
		W_MJ_o = W_MJo * IC_fac * IC_fac;
		if (thread_flag == 0) {
			W_MJ = W_MJ_o;
		}
		T10_ = W_MJ / (0.2403 * (1 + nI_ne) * n20_ * Vol);
		T_c_mil = T10_ * 116.05;
		T_log10_c_mil = Math.log(T_c_mil) / Math.log(10);
		Ip_MA = B_in * I_B;
		if (T10_ < T10c) {
			F_alp = Math.pow(T10_ / T10c, 3);
		} else if (T10_ < 2 * T10c) {
			F_alp = Math.pow(T10_ / T10c, 2);
		} else if (T10_ < 3 * T10c) {
			F_alp = 4 * Math.pow(T10_ / (2 * T10c), 1.5);
		} else {
			F_alp = 4 * Math.pow(1.5, 1.5);
		}
		Pfus_MW_m3 = 0.8 * f_an_at * Math.pow(nDT_ne, 2) * Math.pow(n20_, 2) * F_alp;
		Pfus_MW = Pfus_MW_m3 * Vol;
		Pfus_GW = Pfus_MW * .001;
		Palp_MW = Pfus_MW * 3.5 / 17.6;
		PNeut_MW = Pfus_MW - Palp_MW;
		Pgain_MW = P_in_MW + Palp_MW;
		Pbrem_MW = 0.0168 * n20_ * n20_ * Zeff * Vol * Math.pow(T10_, 0.5);
		// 0.1 to keep Ptrans_MW>0
		Ptrans_MW = Math.max((Pgain_MW - Pbrem_MW), (0.5 * Pgain_MW));
		tau_89 = 0.048 * Math.pow(Ip_MA, 0.85) * Math.pow(Ro, 1.2) * Math.pow(a, 0.3) * Math.pow(n20_, 0.1)
				* Math.pow(B_in, 0.2) * Math.pow(2.5 * k / Ptrans_MW, 0.5);
		tau_98 = 0.0562 * Math.pow(Ip_MA, 0.9) * Math.pow(B_in, 0.15) * Math.pow(Ptrans_MW, -0.69)
				* Math.pow((10 * n20_), 0.41) * Math.pow(2.5, 0.19) * Math.pow(Ro, 1.97) * Math.pow((Ro / a), -0.58)
				* Math.pow(k, 0.78);
		Conf_t = H_fac / 2.0 * tau_98; // old was tau_89, new is tau_98

		// System.out.println("Pgain_MW= " + (float) Pgain_MW + "\tPbrem_MW= " + (float)
		// Pbrem_MW + "\tPtrans_MW= " + (float) Ptrans_MW + "\ttau_89= " + (float)
		// tau_89);

		H98y2 = Conf_t / tau_98;
		H89P = Conf_t / tau_89;
		Plos_MW = W_MJ / Conf_t;
		dW_MW_dt = Pgain_MW - Plos_MW;
		n20_in_rat = mdot_in / (0.000000418 * Vol);
		n20_los_rat = n20_ / Conf_t;
		dn20_dt = n20_in_rat - n20_los_rat;
		Mtot_Gr = n20_ * 0.418 * 0.000001 * Vol / 0.001;
		n20_n20_gw = n20_ / (0.27 * Ip_MA / Math.pow(a, 2));
		n20_n20_bet = n20_ / (Troy_c * Ip_MA * B_in / (40.2 * (1 + nI_ne) * a * T10_));
		Bet = 0.402 * (1 + nI_ne) * n20_ * T10_ / Math.pow(B_in, 2);
		n_wall = PNeut_MW / Area;
		P_e_in = P_in_MW * F_aux + B_in / Bo * 100;
		P_e_gross = PNeut_MW * F_plant;
		P_e = PNeut_MW * F_plant - P_e_in;
		p_e_color_index = (int) (20.0 * P_e / 1000.0);
		p_e_color_index = Math.max(Math.min(20, p_e_color_index), 0); // min max
		deeCanvas.setColorIndex(p_e_color_index);
		if (P_in_MW <= 0) {
			G = 0;
		} else {
			G = Pfus_MW / P_in_MW;
		}
		itt = 0;

		thread_flag = 1;
		if (!isCalculating) {
			isCalculating = true;
			CompletableFuture.runAsync(this::run);
		}
	}

	// ===================================================================================
	// run() Main integration loop converging Energy(W_MJ) & Particles(n20) 
	// [Old Thread converted to run() for conversion to Javascript jal2024
	// ===================================================================================
	// Thread t1 = new Thread(){

	public void run() {
		double startTime, endTime;
		// while (1 != 2){
		while (itt <= 300) { // convergance loop 100=min, 200=>ok 300=>plenty
			itt = itt + 1;
			startTime = System.currentTimeMillis();

			boolean update = false;
			while (!update) {
				endTime = System.currentTimeMillis();
				if ((endTime - startTime) >= 100) { // Response: 1=instantaneous 10=fast 100=nominal

					P_in_MW = Pw_in_MWo;
					mdot_in = M_toto * mdot_V_fac; // Note: this is rate of input mass of particles based on Md Slider
					B_in = B_ino;
					n_new = n20_ + dn20_dt * dt;
					if (n_new <= 0.001 * n20_o) {
						n20_ = n20_o;
					} else {
						n20_ = n_new;
					}
					W_new = W_MJ + dW_MW_dt * dt;
					if (W_new <= 0.001 * W_MJ_o) {
						W_MJ = W_MJ_o;
					} else {
						W_MJ = W_new;
					}
					T10_ = W_MJ / (0.2403 * (1 + nI_ne) * n20_ * Vol);
					T_c_mil = T10_ * 116.05;
					T_log10_c_mil = Math.log(T_c_mil) / Math.log(10);
					Ip_MA = B_in * I_B;
					if (T10_ < T10c) {
						F_alp = Math.pow(T10_ / T10c, 3);
					} else if (T10_ < 2 * T10c) {
						F_alp = Math.pow(T10_ / T10c, 2);
					} else if (T10_ < 3 * T10c) {
						F_alp = 4 * Math.pow(T10_ / (2 * T10c), 1.5);
					} else {
						F_alp = 4 * Math.pow(1.5, 1.5);
					}
					Pfus_MW_m3 = 0.8 * f_an_at * Math.pow(nDT_ne, 2) * Math.pow(n20_, 2) * F_alp;
					Pfus_MW = Pfus_MW_m3 * Vol;
					Pfus_GW = Pfus_MW * .001;
					Palp_MW = Pfus_MW * 3.5 / 17.6;
					PNeut_MW = Pfus_MW - Palp_MW;
					Pgain_MW = P_in_MW + Palp_MW;
					Pbrem_MW = 0.0168 * n20_ * n20_ * Zeff * Vol * Math.pow(T10_, 0.5);
					// 0.1 to keep Ptrans_MW>0
					Ptrans_MW = Math.max((Pgain_MW - Pbrem_MW), (0.5 * Pgain_MW));
					tau_89 = 0.048 * Math.pow(Ip_MA, 0.85) * Math.pow(Ro, 1.2) * Math.pow(a, 0.3) * Math.pow(n20_, 0.1)
							* Math.pow(B_in, 0.2) * Math.pow(2.5 * k / Ptrans_MW, 0.5);
					tau_98 = 0.0562 * Math.pow(Ip_MA, 0.9) * Math.pow(B_in, 0.15) * Math.pow(Ptrans_MW, -0.69)
							* Math.pow((10 * n20_), 0.41) * Math.pow(2.5, 0.19) * Math.pow(Ro, 1.97)
							* Math.pow((Ro / a), -0.58) * Math.pow(k, 0.78);
					Conf_t = H_fac / 2.0 * tau_98; // old was tau_89, new is tau_98
					// System.out.println((float) Pgain_MW + "\n" + (float) Pbrem_MW + "\n" + (float) Ptrans_MW + "\n" + (float) Conf_t);
					// System.out.println();
					// System.out.println("Pgain_MW= " + (float) Pgain_MW + "\tPbrem_MW= " + (float) Pbrem_MW + "\tPtrans_MW= " + (float) Ptrans_MW + "\ttau_89= " + (float) tau_89);
					// System.out.println(B_in + "\n" + Ip_MA + "\n" + Pfus_MW + "\n" + P_e + "\n" + P_in_MW + "\n" + Conf_t + "\n" + T10_);
                    // System.out.println();
					H98y2 = Conf_t / tau_98;
					H89P = Conf_t / tau_89;
					Plos_MW = W_MJ / Conf_t;
					dW_MW_dt = Pgain_MW - Plos_MW;
					n20_in_rat = mdot_in / (0.000000418 * Vol);
					n20_los_rat = n20_ / (1.0 * Conf_t); // jal2024 New Multiplier has NO impact, only needs higher
														 // slider Md value to atain same parameters!!
					dn20_dt = n20_in_rat - n20_los_rat;
					Mtot_Gr = n20_ * 0.418 * 0.000001 * Vol / 0.001;
					n20_n20_gw = n20_ / (0.27 * Ip_MA / Math.pow(a, 2));
					n20_n20_bet = n20_ / (Troy_c * Ip_MA * B_in / (40.2 * (1 + nI_ne) * a * T10_));
					Bet = 0.402 * (1 + nI_ne) * n20_ * T10_ / Math.pow(B_in, 2);
					n_wall = PNeut_MW / Area;
					P_e_in = P_in_MW * F_aux + B_in / Bo * 100;
					P_e_gross = PNeut_MW * F_plant;
					P_e = PNeut_MW * F_plant - P_e_in;
					if (P_in_MW <= 0) {
						G = 0;
					} else {
						G = Pfus_MW / P_in_MW;
					}

					PowerInGauge.setValue(P_e_in);
					PowerInGauge.setLabel("Elec. Pow. In= " + (int) PowerInGauge.getValue() + " MW");
					PowerOutGauge.setValue(P_e);
					PowerOutGauge.setLabel("Net Elec. Pow.= " + (int) PowerOutGauge.getTrueValue() + " MW");// 2024
					TemperatureGauge.setValue(Pfus_GW);
					TemperatureGauge
							.setLabel("Fusion Power= " + decFormat.format(TemperatureGauge.getTrueValue()) + " GW");

					// Panel 5 output
					fieldOnAxisLabel.setText(" Magnetic Field= " + densityFormat.format(B_in) + " T  "); // jal2024
					ipLabel.setText(" Plasma Current= " + decFormat.format(Ip_MA) + " MA  ");
					fusionPowerLabel.setText(" Fusion Power= " + Math.round(Pfus_MW) + " MW  ");
					pinLabel.setText(" Aux. Power= " + decFormat.format(P_in_MW) + " MW  ");
					wallLoadLabel.setText(" Wall Load= " + decFormat.format(n_wall) + " MW/m^2  ");
					QplasmaLabel.setText(" Q= Pfusion/Paux= " + intFormat.format((Pfus_MW / P_in_MW)));// 2024
					bnLabel.setText(
							" Normalized Beta= " + decFormat.format((Bet * 100 * B_in * a) / Ip_MA) + " %Tm/MA  ");
					btLabel.setText(" Toroidal Beta= " + decFormat.format(Bet * 100) + " %  ");
//					nGRLabel.setText(" Greenwald Limit= " + decFormat.format(n20_n20_gw));
					nGRLabel.setText(" Greenwald Limit= " + densityFormat.format(n20_n20_gw)); //jal17sep2024
					tauELabel.setText(" Conf. Time= " + decFormat.format(Conf_t) + " s  ");// 2024
					H98y2Label.setText(" H98y2= " + decFormat.format(H98y2) + "  &  H89P= " + decFormat.format(H89P));// 2024
					q95Label.setText(" Safety Factor, q95= " + decFormat.format(q_edg));
//					ZeffLabel.setText(" Zeff= " + decFormat.format(Zeff));
					ZeffLabel.setText(" Zeff= " + densityFormat.format(Zeff)); //jal17sep2024
					temperatureLabel.setText(" Temperature= " + decFormat.format((T10_ * 10)) + " keV ");
					densityLabel.setText(" Density= " + densityFormat.format(n_new) + " ^20/m^3 ");// 2024

					nDT_neLabel.setText(" DT Fraction= " + decFormat.format(nDT_ne * 100) + " %");// 2024
					PbremLabel.setText(" Bremsstrahlung Rad.= " + intFormat.format(Pbrem_MW) + " MW ");// 2024
					PtransLabel.setText(" Transport Pow. Loss= " + intFormat.format(Ptrans_MW) + " MW ");// 2024
					VolLabel.setText(" Plasma Volume= " + intFormat.format(Vol) + " m^3 ");// 2024
					P_eLabel.setText(" Net Elec. Pow.= " + intFormat.format(P_e) + " MW ");// 2024

					DensityProgress.updateBar((float) n20_n20_gw);
					PressureProgress.updateBar((float) n20_n20_bet);
					update = true;

				} // if ((endTime-startTime)>=100
			} // while ( !update )
		} // while (itt<=100)
		isCalculating = false; // Reset the flag when calculations are done
	} // Run
	// }; // Thread

	// ------------------ main -----------------------------
	public static void main(String[] args) {
		new JStarApp();
	};

} // End of CLASS JStarApp

//JStarApp (j0p5): Conversion of JStar from an applet to an app, J.A.Leuer, jal2024/5/20
//Mac//.../computer/eclipse_ws1/JSrarApp1/
//JStarApp3: jal_6jun2024 change thread integration
//JStarApp4: jal12jun2024 Thread=>Run(), JstarApp_panel5, calculate(), boS,pwS,mdS
//JStarApp5: jal14jun2024 JstarApp3a=>AI=>JStarApp4a (uses “CompletableFuture” instead of Thread)
//App4=>App5 using App4a scheme
//App6: Zeff tested & Correct but slightly different than gasc14_200ms
//       pulse_steady2.xlsm, Change shape index from 20 to 40 => more accurate shape
//JStarApp7: popupwindow
//9: ITER_R=6 optimized, with Be/Ar it seems to ignite?
//JStarApp12 jal21aug2024 clean up for fiverr submit for conversion to Javascript

