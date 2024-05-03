import { ApexOptions } from "apexcharts";
import { TfileAndTags, ChartsWithOptions } from "./types";

const TAG_TIMELINE = "#timeline";

export function buildTimeline(filesWithTags: Array<TfileAndTags>): Array<ChartsWithOptions> {
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

	return [
		{
			name: "YEAR",
			options: {
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
			}
		}]
}

