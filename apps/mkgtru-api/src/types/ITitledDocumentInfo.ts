import { ApiProperty } from "@nestjs/swagger";

export interface ITitledDocumentInfo {
    'title': string,
    'last_modified': {
        'ru': string,
        'en-US': string,
        'timestamp': number,
    },
    'links': {
        'file': string,
        'views': {
            'google_docs': string,
            'viewer1':string,
            'viewer2':string,
        },
    },
    'data_type': string,
}