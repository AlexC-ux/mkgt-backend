import { ApiProperty } from "@nestjs/swagger";

export interface ITitledDocumentInfo {
    'title': string,
    'last_modified': {
        'ru': string,
        'en-US': string,
        'timestamp': number,
        'now': string,
    },
    'links': {
        'file': string,
        'file_base64':string,
        'views': {
            'google_docs': string,
            'server_viewer': string,
        }
    },
    'data_type': string,
}