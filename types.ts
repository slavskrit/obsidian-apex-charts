import { TFile } from "obsidian";
import { ApexOptions } from "apexcharts";

export interface TfileAndTags {
  tfile: TFile,
  tags: Array<string>
}

export interface ChartsWithOptions {
  name: string,
  options: ApexOptions,
}

export type ChartType = 'timeline' | 'addMORE';


