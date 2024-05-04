// @ts-nocheck
import { TfileAndTags, ChartsWithOptions } from "./types";

const TAG_TIMELINE = "#timeline";

interface TimelineRange {
	x: string,
	y: Array<Date>,
	meta: string,
}

function b(s, e, n) {
	return {
		x: n,
		y: [s, e],
	}
}

function dd(d) {
	return d.toISOString().split('T')[0];
}

function getOptions(year, series) {
	return {
		name: year,
		options: {
			series: series,
			chart: {
				height: 250,
				type: 'rangeBar',
				events: {
					dataPointSelection: (_, __, config) => {
						const path = ranges[config.dataPointIndex].meta;
						const file = this.app.vault.getFileByPath(path);
						this.app.workspace.activeLeaf.openFile(file);

					},
				}
			},
			dataLabels: {
				enabled: true,
				formatter: function(_, opts) {
					var label = opts.w.globals.labels[opts.dataPointIndex]
					return label;
				},
				style: {
					colors: ['#f3f4f5', '#fff']
				}
			},
			plotOptions: {
				bar: {
					horizontal: true,
					distributed: true,
					dataLabels: {
						hideOverflowingLabels: false
					}
				}
			},
			yaxis: {
				labels: {
					maxWidth: 60,
				}
			},
			xaxis: {
				type: 'datetime',
			}
		}
	}
};

function splitByYear(r) {
	let groupedByYears = new Map<number, Array<any>>();
	r.forEach((t) => {
		const name = t.x;
		let startDate = t.y[0];
		let endDate = t.y[1];
		let startYear = startDate.getFullYear();
		let endYear = endDate.getFullYear();
		let entities = groupedByYears.get(startYear) ?? [];
		if (startYear < endYear) {
			while (startYear < endYear) {
				entities.push(b(startDate, new Date(`${startYear}-12-31`), name));
				groupedByYears.set(startYear, entities);
				startYear++;
				startDate = new Date(`${startYear}-01-01`);
				entities = groupedByYears.get(startYear) ?? [];
			}
		}
		entities.push(b(startDate, endDate, name));
		groupedByYears.set(startYear, entities);
	});

	return groupedByYears;
}

// TODO: Add more flexibility how to split dates. Now is by year.
export function buildTimeline(filesWithTags: Array<TfileAndTags>): Array<ChartsWithOptions> {
	const ranges: Array<TimelineRange> = filesWithTags
		.filter((f) => f.tags.includes(TAG_TIMELINE))
		.map((f) => {
			const metadata = this.app.metadataCache.getFileCache(f.tfile);
			return {
				x: f.tfile.name,
				y: [
					new Date(metadata.frontmatter.start),
					new Date(metadata.frontmatter.end),
				],
				meta: f.tfile.path,
			}
		});
	const optionsGroupedByYear = [];
	splitByYear(ranges).forEach((ranges, year: number) => {
		optionsGroupedByYear.push(getOptions(year, ranges));
	});
	console.log(optionsGroupedByYear);
	return optionsGroupedByYear;
};

