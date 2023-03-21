import { ApiProperty } from "@nestjs/swagger";

export interface ITitledDocumentInfo {
    'title': string,
    'last_modified': {
        'ru': string,
        'en-US': string,
        'timestamp': number,
        'now':string,
    },
    'links': {
        'file': string,
        'views': {
            'google_docs': string,
            'viewer1':string,
        },
    },
    'data_type': string,
}