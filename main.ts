import ApexCharts from 'apexcharts'
import { ApexOptions } from "apexcharts";
import { Plugin, TFile, getAllTags } from "obsidian";

const TAG_TO_ENABLE = "#obsicharts";
const TAG_TIMELINE = "#timeline";

interface TfileAndTags {
	tfile: TFile,
	tags: Array<string>
}

type CHART_TYPE = 'timeline' | 'addMORE';

function buildTimelineOptions(filesWithTags: Array<TfileAndTags>): ApexOptions {
	const ranges = filesWithTags
		.filter((f) => f.tags.includes(TAG_TIMELINE))
		.map((f) => {
			const metadata = this.app.metadataCache.getFileCache(f.tfile);
			return {
				x: f.tfile.name,
				y: [
					new Date(metadata.frontmatter.start).getTime(),
					new Date(metadata.frontmatter.end).getTime(),
				],
				meta: f.tfile.path,
			}
		});

	return {
		series: [
			{
				data: ranges
			}
		],
		chart: {
			height: 150,
			type: 'rangeBar',
			events: {
				dataPointSelection: (_, __, config) => {
					const path = ranges[config.dataPointIndex].meta;
					const file = this.app.vault.getFileByPath(path);
					this.app.workspace.activeLeaf.openFile(file);

				},
			}
		},
		plotOptions: {
			bar: {
				horizontal: true
			}
		},
		xaxis: {
			type: 'datetime'
		}
	};
}

function getChartOptions(chartType: CHART_TYPE): ApexOptions {
	const allDocumentsToProcess = getAllTheDocumentsToWorkWith();
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
		this.registerMarkdownCodeBlockProcessor("obsicharts", (source, el, ctx) => {
			// console.log('register');
			const chartType = source.split('\n')[0];
			const options = getChartOptions(chartType);
			// el.empty();
			const a = el.createDiv();
			a.textContent = "test";
			const t = a.createDiv("TESToaHEAD:refs/heads/master")
			//
			// console.log(source, el, ctx);
			// const a = ctx.addChild("div");

			// console.log(a);
			var chart = new ApexCharts(t, options);
			chart.render();
			// const chartContainer = el.createDiv();
			// chartContainer.setAttribute("id", "chart")
			// ctx.addChild(chartContainer);
			// const chartType = source.split('\n')[0];
			// const options = getChartOptions(chartType);
			// var chart = new ApexCharts(document.querySelector("#chart"), options);
			// chart.render();
		});
	}
}
