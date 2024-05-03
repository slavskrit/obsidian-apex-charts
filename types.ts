import { TFile } from "obsidian";

export interface TfileAndTags {
  tfile: TFile,
  tags: Array<string>
}

export type ChartType = 'timeline' | 'addMORE';


