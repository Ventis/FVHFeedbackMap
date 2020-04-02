import {packageAction} from "components/types";

export const loginUrl = '/rest-auth/login/';
export const registerUrl = '/rest-auth/registration/';

export const availablePackagesUrl = "/rest/available_packages/";
export const reservePackageUrl = (id: number) => `/rest/available_packages/${id}/reserve/`;

export const pendingOutgoingPackagesUrl = "/rest/pending_outgoing_packages/";
export const newPackageSchemaUrl = "/rest/pending_outgoing_packages/jsonschema/";
export const deliveredOutgoingPackagesUrl = "/rest/delivered_outgoing_packages/";
export const myLocationUrl = "/rest/my_location/";

export const myPackagesUrl = "/rest/my_packages/";
export const myDeliveredPackagesUrl = "/rest/my_delivered_packages/";
export const myPackageActionUrl = (id: number, action: packageAction) => `/rest/my_packages/${id}/register_${action}/`;

export const uuidPackageUrl = (uuid: string) => `/rest/packages/${uuid}/`;

export const osmImageNotesUrl = "/rest/osm_image_notes/";
export const osmImageNoteUrl = (id: number) => `/rest/osm_image_notes/${id}/`;
export const acceptOSMImageNoteUrl = (id: number) => `/rest/osm_image_notes/${id}/mark_reviewed/`;
export const rejectOSMImageNoteUrl = (id: number) => `/rest/osm_image_notes/${id}/hide_note/`;
export const upvoteOSMImageNoteUrl = (id: number) => `/rest/osm_image_notes/${id}/upvote/`;
export const downvoteOSMImageNoteUrl = (id: number) => `/rest/osm_image_notes/${id}/downvote/`;
export const osmImageNoteCommentsUrl = `/rest/osm_image_note_comments/`;

export const osmFeaturePropertiesUrl = "/rest/osm_image_notes/property_schemas/";

export const osmEntranceUrl = (id: number) => `/rest/osm_entrances/${id}/`;
