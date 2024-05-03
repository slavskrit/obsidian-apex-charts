import ApexCharts from 'apexcharts'
import { ApexOptions } from "apexcharts";
import { Plugin, TFile, getAllTags } from "obsidian";
import { buildTimelineOptions } from "./timeline"
import { TfileAndTags, ChartType } from "./types";

const TAG_TO_ENABLE = "#obsicharts";

function getChartOptions(chartType: ChartType): ApexOptions {
	const allDocumentsToProcess = getAllTheDocumentsToWorkWith();
	// TODO: Add more charts.
	switch (chartType) {
		case 'timeline': {
			return buildTimelineOptions(allDocumentsToProcess);
		}
	}
	return {};
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
			const options = getChartOptions(chartType as ChartType);
			const chartContainer = el.createDiv();
			var chart = new ApexCharts(chartContainer, options);
			// TODO: Figure out why we need this.
			setTimeout(() => {
				chart.render();
			}, 0);
		});
	}
}
