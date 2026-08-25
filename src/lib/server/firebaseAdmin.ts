import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

const firebaseAdminApp =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert({
                projectId: 'zingram-eced2',
                clientEmail:
                    'firebase-adminsdk-fbsvc@zingram-eced2.iam.gserviceaccount.com',
                privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9/jjfpvdJNce0\nLVeA1ipYd0A6zOSCbYSAWrcjbhEtsKceB2FVbEHmF9BJXW5r3BrTXgGVOvmEnluB\naEAPXs77K0KpmgaX49IABj4Ey2t4LBjsw6nIN+lywgYSdV2Tci14YDaiytTOLJTW\n3JkCSO6kPvzMWCcr5oJ1lU1l21XDn/LHRPoD0jy/spLUnxYcXYt7xaOBpTdkkk9D\nmpLP46EWlWCzNeytqZtgxD17kfK/3NH81Su4JSaY0jt3L+hB95OarFsZwrk7dB+Q\n420U+uW77P6WyHbKQIU2aQq5hJRfHVKNtz8/BPZYxYqp94JUZSFUD58gloNz3Q0U\niXjNGi0lAgMBAAECggEALOMQlcpxNwM1PNzPhRlUJNV7v8ijnir4uIh2JzE8bsKD\nISWWOePbR9zNcV/ZFDOKxPA7SIIH7Gyras3yAI+iMBYe6EoDD8Sb2zSeV2yl5dzp\nQJrTlIGdLmcnnxnKc2jw1DVLAzgPgexnd8HjhnYrp3NYL4EONCGAJf6RrCRfRVmu\n1P4Tbaei2orP+DV1PDgIJZQYhPmcMdq1lpD+/Wz/0bMUT//xAIENErPz4nUGu0rn\nWxLshX38a+DwgtntquBIN0VdONUc0tE03DcSVJAf280BO1eM8M4YkPRhjZsyJQeH\nsBXqEs8umX3R4GhG0Aj2xDBylW0rQGXHVsOmcbgkmwKBgQDpknDVb4+/3pu/ZNTf\nklmAa7mThzoeNOCK6MEar1gxxnxowy6OYsg1s1WiASBUmq5evwXwVn082l8y1VqZ\nb8IORSJEUNLMYP1D059h2d9p/oWxH3h+QaSw30uCL8Rxpl2npeo12vfhaHfkyYQR\n+sts4gPDOVqsYgBB0fFh64j6twKBgQDQPIsOjWnnccgGpklIsLNHNefE7jCEPiec\ns9MJZM3ps1WsAVGhKgCUGZhlF5LW02t/ngf7fxxR+Y0s5OMDmIxrrEQJJC5rjXEA\norjWXs3u5gVZFWL/GZNqeVdPcoQ60voA1m44rHCXb8FBBGrjJZSqVSRO0JQPp8X3\nG1wX4jGrAwKBgQCNuKo4BzIMtHCCKBc19KHT1wlJ55IvA9x+zI1muJ/ly85u7ocQ\nJAXg94hs/Qv16ckFehiLZJ8mzkVXHbeURAhWCkKpevT8x5jEj+I0SDNUJ/hMqZC9\n4uyf2U0CmCM05kILWBONS+h935pnupIlKqxFy7mGugU3dVs8lLtGs9hwbwKBgQCt\nd2HXk5H/TVd1wpwVw6z0y0DxWgJsh2J0NZC9qI2n+s6JZOfdO6ITvWaoAAVAlApe\n2wSHSxIKb7pdBabe3ftLzss2Wj+ZNNBH2UXkvkEKm+8kkJ5RJ7sX3VEQS7M/VXUR\nsY9MAsogPOZeBRINesbnRdnjFfnhOL++47nJ45HAhQKBgHrOQu8Y1yxFNwuZtqfw\nQPeftEZ/MKtiO9oqDwurO0HaPTSEGa1LNSjdp9pi/70vu5ssJzgAwAcdV95sRn0X\ndHfzCg20Kq9SwnLz9W0CxuRpjaemy4ByosSjDHdrMZe8lalyTYhvPLZamGHnVN2k\ncRfIxxmX76PQvyvyl31mviIA\n-----END PRIVATE KEY-----\n',

            })
        });

export const adminMessaging =
    getMessaging(firebaseAdminApp);

export const adminDb =
    getFirestore(firebaseAdminApp);