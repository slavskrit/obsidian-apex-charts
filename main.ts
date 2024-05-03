import ApexCharts from 'apexcharts'
import { Plugin, TFile, getAllTags } from "obsidian";
import { buildTimeline } from "./timeline"
import { TfileAndTags, ChartType, ChartsWithOptions } from "./types";

const TAG_TO_ENABLE = "#obsicharts";

function getCharts(chartType: ChartType): Array<ChartsWithOptions> {
	const allDocumentsToProcess = getAllTheDocumentsToWorkWith();
	// TODO: Add more charts.
	switch (chartType) {
		case 'timeline': {
			return buildTimeline(allDocumentsToProcess);
		}
	}
	return [];
}

function getAllTheDocumentsToWorkWith(): TfileAndTags[] {
	const cache = this.app.metadataCache;
	const files = this.app.vault.getMarkdownFiles();
	const filesWithTags: Array<TfileAndTags> = [];
	files.forEach((file: TFile) => {
		const fileCache = cache.getFileCache(file);
		const tags = getAllTags(fileCache);
		if (tags?.includes(TAG_TO_ENABLE)) {
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
			const chartType = source.split('\n')[0];
			const charts: Array<ChartsWithOptions> = getCharts(chartType as ChartType);
			charts.forEach((chart: ChartsWithOptions) => {
				const chartContainer = el.createDiv();
				chartContainer.textContent = chart.name;
				var apexChart = new ApexCharts(chartContainer, chart.options);
				// TODO: Figure out why we need this.
				setTimeout(() => {
					apexChart.render();
				}, 0);

			})
		});
	}
}
