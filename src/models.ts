import ArrayContaining = jasmine.ArrayContaining;
/**
 * Created by Tom on 19-1-2016.
 */
export class Episode {
    airDate:string;
    airDateUtc: any;
    episodeFileId: number;
    episodeNumber: number;
    hasFile: boolean;
    id: number;
    monitored: boolean;
    seasonNumber: number;
    showInformation:ShowInformation;
    seriesId: number;
    title: string;
    unverifiedSceneNumbering: boolean;
    downloadInformation: DownloadInformation;
}


/**
 * Created by Tom on 19-1-2016.
 * show, complete show object
 */
export class Show {
    added: string;
    airTime: string;
    alternateTitles:Array<string>;
    certification: string;
    cleanTitle: string;
    episodeCount: number;
    episodeFileCount: number;
    firstAired: string;
    genres: Array<string>;
    id: number;
    images:Array<Image>;//array of images
    imdbId: string;
    lastInfoSync: string;
    monitored: boolean;
    network: string;
    nextAiring: string;
    overview: string;
    path: string;
    previousAiring: string;
    profileId: number;
    qualityProfileId: number;
    ratings: {votes: number, value: number};
    runtime: number;
    seasonCount: number;
    seasonFolder: boolean;
    seasons: Array<Season>;
    episodes: Array<Episode>;
    seriesType: string;
    sizeOnDisk: number;
    sortTitle: string;
    status: string;
    tags: Array<string>;
    title: string;
    titleSlug: string;
    totalEpisodeCount: number;
    tvMazeId: number;
    tvRageId: number;
    tvdbId: number;
    useSceneNumbering: boolean;
    year: number;
}

/**
 * Created by Tom on 19-1-2016.
 * show, simple object without series or seasons objects
 */

export class ShowInformation {
    added: string;
    airTime: string;
    alternateTitles:Array<string>;
    certification: string;
    cleanTitle: string;
    episodeCount: number;
    episodeFileCount: number;
    firstAired: string;
    genres: Array<string>;
    id: number;
    images:Array<Image>;//array of images
    imdbId: string;
    lastInfoSync: string;
    monitored: boolean;
    network: string;
    nextAiring: string;
    overview: string;
    path: string;
    previousAiring: string;
    profileId: number;
    qualityProfileId: number;
    ratings: {votes: number, value: number};
    runtime: number;
    seasonCount: number;
    seasonFolder: boolean;
    seriesType: string;
    sizeOnDisk: number;
    sortTitle: string;
    status: string;
    tags: Array<string>;
    title: string;
    titleSlug: string;
    totalEpisodeCount: number;
    tvMazeId: number;
    tvRageId: number;
    tvdbId: number;
    useSceneNumbering: boolean;
    year: number;
}


//seasons object
export class Season {
    monitored: boolean;
    seasonNumber: number;
    episodeCount: number;
    episodeFileCount: number;
    percentOfEpisodes: number;
    sizeOnDisk: number;
    totalEpisodeCount: number;
}

//image object
export class Image {
    coverType: string;
    url: string;
}

//download information object
export class DownloadInformation {
    downloadClient: string;
    droppedPath: string;
    importedPath: string;
    downloadId: string;
    eventType: string;
    id: number;
    qualityId: number;
    qualityName: string;
    revision: number;
    real: number;
    qualityCutoffNotMet: boolean;
    sourceTitle:string;
}