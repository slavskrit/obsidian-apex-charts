// @ts-ignore
import ApexCharts from 'apexcharts'
import { Plugin, TFile, getAllTags } from "obsidian";
import { buildTimeline } from "./timeline"
import { TfileAndTags, ChartType, ChartsWithOptions } from "./types";

const TAG_TO_ENABLE = "#obsicharts";

function getCharts(chartType: ChartType, allDocumentsToProcess: TfileAndTags[]): Array<ChartsWithOptions> {
	// TODO: Add more charts.
	switch (chartType) {
		case 'timeline': {
			return buildTimeline(allDocumentsToProcess);
		}
	}
	return [];
}

function getAllTheDocumentsToWorkWith(tagToFilter: string): TfileAndTags[] {
	const cache = this.app.metadataCache;
	const files = this.app.vault.getMarkdownFiles();
	const filesWithTags: Array<TfileAndTags> = [];
	files.forEach((file: TFile) => {
		const fileCache = cache.getFileCache(file);
		const tags = getAllTags(fileCache);
		if (tags?.includes(TAG_TO_ENABLE) && tags?.includes(`#${tagToFilter}`)) {
			filesWithTags.push(
				{
					tfile: file,
					tags: tags,
				}
			)
		}
	});
	return filesWithTags;
}

// TODO: Handle exceptions.
export default class ObsiChartsPlugin extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor("obsicharts", (source, el, _) => {
			const config = source.split('\n');
			// TODO: Make config a schema to parse and show as a documentation.
			const chartType = config[0];
			const tagToDisplay = config[1] ?? "";
			const allDocs = getAllTheDocumentsToWorkWith(tagToDisplay);
			// TODO: Add more options to timneline. Like should split by year yes/no.
			const charts: Array<ChartsWithOptions> = getCharts(chartType as ChartType, allDocs);
			charts?.forEach((chart: ChartsWithOptions) => {
				// TODO: Figure out why we need this.
				setTimeout(() => {
					const year = el.createDiv();
					const chartContainer = el.createDiv("chart");
					year.textContent = chart.name;
					console.log(chart.options);
					var apexChart = new ApexCharts(chartContainer, chart.options);
					apexChart.render();
				}, 0);

			})
		});
	}
}
