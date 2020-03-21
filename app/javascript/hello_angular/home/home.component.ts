import { Component, ViewChild } from '@angular/core';
import templateString from './home.html';
import { NgFlashMessageService } from 'ng-flash-messages';
import { AppService } from '../app/app.service';
import { MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { ChartType, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
import { AppComponent } from '../app/app.component';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

@Component({
	template: templateString
})
export class HomeComponent {
	constructor(
		private ngFlashMessageService: NgFlashMessageService,
		private appService: AppService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private router: Router,
		private app: AppComponent,
		private loadingBar: LoadingBarService
	) {}
	localLastUpdated: string = 'กำหลังโหลด...';
	globleLastUpdated: string = 'กำหลังโหลด...';
	pieChartOptions: ChartOptions = {
		responsive: true,
		legend: {
			position: 'bottom'
		}
	};
	pieChartDataLocal: number[] = [0, 0, 0];
	pieChartLabels: Label[] = [['ผู้ติดเชื้อ'], ['กำลังอยู่ในการรักษา'], ['รักษาหาย'], 'เสียชีวิต'];
	pieChartData: number[] = [0, 0, 0];
	pieChartType: ChartType = 'pie';
	pieChartColors = [
		{
			backgroundColor: ['#FCD35E', '#BFFD59', '#5EFCAD', '#FC5E71']
		}
	];
	totalLocal: any = {
		confirmed: 0,
		healings: 0,
		recovered: 0,
		deaths: 0
	};
	total: any = {
		confirmed: 0,
		healings: 0,
		recovered: 0,
		deaths: 0
	};
	barChartOptions: ChartOptions = {
		responsive: true,
		scales: {
			xAxes: [
				{
					ticks: {
						beginAtZero: true
					}
				}
			],
			yAxes: [
				{
					ticks: {
						beginAtZero: true
					}
				}
			]
		}
	};
	barChartDataLocal: any = [
		{ data: [0, 0, 0, 0, 0, 0, 0], label: 'ผู้ติดเชื้อ' },
		{ data: [0, 0, 0, 0, 0, 0, 0], label: 'กำลังอยู่ในการรักษา' },
		{ data: [0, 0, 0, 0, 0, 0, 0], label: 'รักษาหายแล้ว' },
		{ data: [0, 0, 0, 0, 0, 0, 0], label: 'เสียชีวิต' }
	];
	barChartLabels: Label[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	barChartType: ChartType = 'bar';
	barChartData: any = [
		{ data: [0, 0, 0, 0, 0, 0, 0], label: 'ผู้ติดเชื้อ' },
		{ data: [0, 0, 0, 0, 0, 0, 0], label: 'กำลังอยู่ในการรักษา' },
		{ data: [0, 0, 0, 0, 0, 0, 0], label: 'รักษาหายแล้ว' },
		{ data: [0, 0, 0, 0, 0, 0, 0], label: 'เสียชีวิต' }
	];
	barChartColors = [
		{
			backgroundColor: '#FCD35E',
			borderColor: '#FCD35E'
		},
		{
			backgroundColor: '#BFFD59',
			borderColor: '#BFFD59'
		},
		{
			backgroundColor: '#5EFCAD',
			borderColor: '#5EFCAD'
		},
		{
			backgroundColor: '#FC5E71',
			borderColor: '#FC5E71'
		}
	];
	latitude: number = 13.7530066;
	longitude: number = 100.4960144;
	hospitals: any = [];
	allCountryDisplayedColumns: string[] = [
		'country_flag',
		'country',
		'travel',
		'confirmed',
		'healings',
		'recovered',
		'deaths'
	];
	allCountryDataSource: any = [];
	@ViewChild('allCountry', { read: MatSort, static: true }) allCountrySort: MatSort;
	@ViewChild('allCountryPaginator', { static: true }) allCountryPaginator: MatPaginator;

	patientInformationDisplayedColumns: string[] = [
		'detected_at',
		'origin',
		'treat_at',
		'status',
		'job',
		'gender',
		'age',
		'type'
	];
	patientInformationDataSource: any = [];
	@ViewChild('patientInformation', { read: MatSort, static: true }) patientInformationSort: MatSort;
	@ViewChild('patientInformationPaginator', { static: true })
	patientInformationPaginator: MatPaginator;
	patientInformationCount: number = 0;
	localAddTodayCount: number = 0;
	cases: any = [];
	safeZones: any = [];

	ngOnInit() {
		this.getLocation();
		this.loadData();
		this.loadCasesThai();
		this.loadHospital();
		this.loadSafeZone();

		setInterval(() => {
			if (this.barChartType === 'bar') {
				this.barChartType = 'line';
				this.barChartColors = [
					{
						backgroundColor: 'rgb(252, 211, 94, 0.5)',
						borderColor: '#FCD35E'
					},
					{
						backgroundColor: 'rgb(191, 253, 89, 0.5)',
						borderColor: '#BFFD59'
					},
					{
						backgroundColor: 'rgb(94, 252, 173, 0.5)',
						borderColor: '#5EFCAD'
					},
					{
						backgroundColor: 'rgb(252, 94, 113, 0.5)',
						borderColor: '#FC5E71'
					}
				];
			} else {
				this.barChartType = 'bar';
				this.barChartColors = [
					{
						backgroundColor: '#FCD35E',
						borderColor: '#FCD35E'
					},
					{
						backgroundColor: '#BFFD59',
						borderColor: '#BFFD59'
					},
					{
						backgroundColor: '#5EFCAD',
						borderColor: '#5EFCAD'
					},
					{
						backgroundColor: '#FC5E71',
						borderColor: '#FC5E71'
					}
				];
			}
		}, 30000);
	}

	loadData() {
		this.dailyTotalLocal();
		this.countryRetroact();
		this.retroact();
		this.loadCountryCases();
		this.loadAllCountry();
	}

	getLocation() {
		this.app.getPosition().then(pos => {
			this.latitude = pos.lat;
			this.longitude = pos.lng;
		});
	}

	loadCasesThai() {
		this.appService.all('api/covids/cases_thai').subscribe(
			resp => {
				let response: any = resp;
				this.cases = response.data;
			},
			e => {
				this.app.openSnackBar(e.message, 'Close', 'red-snackbar');
			}
		);
	}

	loadHospital() {
		this.appService.all('api/covids/hospital').subscribe(
			resp => {
				let response: any = resp;
				this.hospitals = response.data;
			},
			e => {
				this.app.openSnackBar(e.message, 'Close', 'red-snackbar');
			}
		);
	}

	loadSafeZone() {
		this.appService.all('api/covids/safe_zone').subscribe(
			resp => {
				let response: any = resp;
				this.safeZones = response.data;
			},
			e => {
				this.app.openSnackBar(e.message, 'Close', 'red-snackbar');
			}
		);
	}

	dailyTotalLocal() {
		this.appService.all('api/covids/constants').subscribe(
			resp => {
				let response: any = resp;
				this.localAddTodayCount = response.data.add_today_count;
				this.localLastUpdated = response.data.last_updated;
				this.totalLocal = response.data;
				this.pieChartDataLocal = [
					this.totalLocal.confirmed,
					this.totalLocal.healings,
					this.totalLocal.recovered,
					this.totalLocal.deaths
				];
			},
			e => {
				this.app.openSnackBar(e.message, 'Close', 'red-snackbar');
			}
		);
	}

	countryRetroact() {
		this.appService.all('api/covids/country_retroact').subscribe(
			resp => {
				let response: any = resp;
				this.barChartLabels = Object.keys(response.data);
				Object.keys(response.data).forEach((key, index) => {
					this.barChartDataLocal[0].data[index] = response.data[key].confirmed;
					this.barChartDataLocal[1].data[index] = response.data[key].healings;
					this.barChartDataLocal[2].data[index] = response.data[key].recovered;
					this.barChartDataLocal[3].data[index] = response.data[key].deaths;
				});
			},
			e => {
				this.app.openSnackBar(e.message, 'Close', 'red-snackbar');
			}
		);
	}

	retroact() {
		this.appService.all('api/covids/retroact').subscribe(
			resp => {
				let response: any = resp;
				this.barChartLabels = Object.keys(response.data);
				Object.keys(response.data).forEach((key, index) => {
					this.barChartData[0].data[index] = response.data[key].confirmed;
					this.barChartData[1].data[index] = response.data[key].healings;
					this.barChartData[2].data[index] = response.data[key].recovered;
					this.barChartData[3].data[index] = response.data[key].deaths;
				});
			},
			e => {
				this.app.openSnackBar(e.message, 'Close', 'red-snackbar');
			}
		);
	}

	loadAllCountry() {
		this.appService.all('api/covids/world').subscribe(
			resp => {
				let response: any = resp;
				this.allCountryDataSource = new MatTableDataSource<any>(response.data.statistics);
				this.allCountryDataSource.paginator = this.allCountryPaginator;
				this.allCountryDataSource.sort = this.allCountrySort;
				this.globleLastUpdated = response.data.last_updated;
				this.total = response.data;
				this.pieChartData = [
					this.total.confirmed,
					this.total.healings,
					this.total.recovered,
					this.total.deaths
				];
			},
			e => {
				this.app.openSnackBar(e.message, 'Close', 'red-snackbar');
			}
		);
	}

	loadCountryCases() {
		this.appService.all('api/covids/cases').subscribe(
			resp => {
				let response: any = resp;
				this.patientInformationCount = response.data.length;
				this.patientInformationDataSource = new MatTableDataSource<any>(response.data);
				this.patientInformationDataSource.paginator = this.patientInformationPaginator;
				this.patientInformationDataSource.sort = this.patientInformationSort;
			},
			e => {
				this.app.openSnackBar(e.message, 'Close', 'red-snackbar');
			}
		);
	}

	searchPatientInformation(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.patientInformationDataSource.filter = filterValue.trim().toLowerCase();

		if (this.patientInformationDataSource.paginator) {
			this.patientInformationDataSource.paginator.firstPage();
		}
	}

	searchAllCountry(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.allCountryDataSource.filter = filterValue.trim().toLowerCase();

		if (this.allCountryDataSource.paginator) {
			this.allCountryDataSource.paginator.firstPage();
		}
	}
}
