import { TfileAndTags, TimelineRange, ChartsWithOptions } from "./types";

const TAG_TIMELINE = "#timeline";

interface TimelineRange {
	x: string,
	y: Array<Date>,
	meta: string,
}

interface TimelineForApex {
	x: string,
	y: Array<number>,
	meta: string,
}


function splitByYear(ranges: Array<TimelineRange>): Map<number, Array<TimelineForApex>> {
	const result = new Map<number, Array<TimelineForApex>>;
	ranges.forEach((t => {
		const name = t.x;
		const meta = t.meta;
		let start = t.y[0];
		const realEnd = t.y[1];
		while (start.getFullYear() < realEnd.getFullYear()) {
			let newEnd = new Date(`${start.getFullYear() + 1}-01-01`);
			const l: Array<TimelineForApex> = result.get(start.getFullYear()) ?? [];
			l.push(
				{
					x: name,
					y: [start.getTime(), newEnd.getTime()],
					meta: meta
				});
			result.set(start.getFullYear(), l);
			const nexYear = `${start.getFullYear() + 1}/01/01`;
			start = new Date(nexYear);

			if (newEnd.getFullYear() == realEnd.getFullYear()) {
				const l: Array<TimelineForApex> = result.get(start.getFullYear()) ?? [];
				l.push({
					x: name,
					y: [newEnd.getTime(), realEnd.getTime()],
					meta: meta
				});
				result.set(newEnd.getFullYear(), l);
				break;
			}
		}
		const l: Array<TimelineForApex> = result.get(start.getFullYear()) ?? [];
		l.push({
			x: name,
			y: [start.getTime(), realEnd.getTime()],
			meta: meta
		});
		result.set(start.getFullYear(), l);
	}));
	return result;
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
	let grouped = splitByYear(ranges);
	console.log(grouped);
	let years = [...grouped.keys()];
	years = years.sort((a, b) => a - b);
	const res = years.map((year) => {
		return {
			name: year,
			options: {
				series: [
					{
						data: grouped.get(year)
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
				dataLabels: {
					enabled: true,
					formatter: function(val, opts) {
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
				xaxis: {
					type: 'datetime'
				}
			}
		}
	});
	return res;
}


