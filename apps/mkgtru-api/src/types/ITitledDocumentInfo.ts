export interface ITitledDocumentInfo {
    'title': string,
    'last_modified': {
        'ru': string,
        'en-US': string,
        'timestamp': number,
        'difference': number
    },
    'links': {
        'file': string,
        'views': {
            'google_docs': string,
            'local_html': string,
        },
    },
    'data_type': string,
}