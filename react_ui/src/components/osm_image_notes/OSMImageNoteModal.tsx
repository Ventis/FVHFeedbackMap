import React from 'react';

import sessionRequest from "sessionRequest";
import {osmImageNoteUrl} from "urls";
import {AppContext, MapFeatureTypes, OSMImageNote} from "components/types";
import Modal from "util_components/bootstrap/Modal";
import ErrorAlert from "util_components/bootstrap/ErrorAlert";

import 'components/osm_image_notes/OSMImageNotes.css';

import OSMFeaturesSelection from "util_components/osm/OSMFeaturesSelection";
import {LocationTuple, Location} from "util_components/types";
import OSMImageNoteReviewActions from "components/osm_image_notes/OSMImageNoteReviewActions";
import MapFeatureSet from "components/map_features/MapFeatureSet";
import Icon from "util_components/bootstrap/Icon";
import OSMImageNoteTags from "components/osm_image_notes/OSMImageNoteTags";
import ZoomableImage from "util_components/ZoomableImage";
import OSMImageNoteVotes from "components/osm_image_notes/OSMImageNoteVotes";
import OSMImageNoteComments from "components/osm_image_notes/OSMImageNoteComments";
import AssociateEntranceModal from "components/osm_image_notes/AssociateEntranceModal";
import {OSMFeature} from "util_components/osm/types";
import {formatTimestamp} from "utils";
import {userCanEditNote} from "./utils";
import NearbyAddressesAsOSMLoader from "components/osm_image_notes/NearbyAddressesAsOSMLoader";
import MapToolButton from "components/osm_image_notes/MapToolButton";

type OSMImageNoteModalProps = {
  mapFeatureTypes?: MapFeatureTypes,
  note: OSMImageNote,
  onClose: () => any,
  showOnMap?: () => any,
  requestLocation?: (fn: (l: Location) => any, initial: any) => any,
  cancelLocationRequest?: () => any,
  fullScreen?: boolean
}

type OSMImageNoteModalState = {
  note?: OSMImageNote,
  editingRelatedPlaces: boolean,
  error: boolean
  nearbyFeatures: OSMFeature[],
  nearbyAddresses: OSMFeature[],
  linkingEntrance?: OSMFeature,
  repositioning: boolean
}

const initialState: OSMImageNoteModalState = {
  editingRelatedPlaces: false,
  error: false,
  nearbyFeatures: [],
  nearbyAddresses: [],
  repositioning: false
};

export default class OSMImageNoteModal extends React.Component<OSMImageNoteModalProps, OSMImageNoteModalState> {
  static contextType = AppContext;
  state: OSMImageNoteModalState = initialState;

  componentDidMount() {
    this.fetchNote();
  }

  componentDidUpdate(prevProps: Readonly<OSMImageNoteModalProps>) {
    if (prevProps && (prevProps.note.id != this.props.note.id)) this.fetchNote();
  }

  render() {
    const {onClose, fullScreen} = this.props;
    const {note, repositioning} = this.state;

    if (repositioning) return <div className="mt-4 text-right">
      Scroll map to select position{' '}
      <MapToolButton onClick={this.cancelLocationRequest}>
        Cancel
      </MapToolButton>
    </div>;

    if (!note) return null;

    const modalCls = note.image ? 'modal-xl' : 'modal-dialog-centered';
    return fullScreen ? <><h6 className="pt-2">{this.renderTitle()}</h6>{this.renderContent()}</>
    : <Modal title={this.renderTitle()} className={modalCls} onClose={onClose}>
        {this.renderContent()}
      </Modal>
    ;
  }

  renderContent() {
    const {mapFeatureTypes, onClose} = this.props;
    const {note, editingRelatedPlaces, error, nearbyFeatures, nearbyAddresses, linkingEntrance, repositioning} = this.state;
    const {user} = this.context;

    if (repositioning || !note) return null;

    const canEdit = userCanEditNote(user, note);

    const location = [note.lon, note.lat] as LocationTuple;

    const tags = note.tags || [];

    const canEditRelatedPlaces = canEdit && !editingRelatedPlaces;
    const relatedFeatures =
      note.osm_features
        ? nearbyFeatures.filter(f => note.osm_features.includes(f.id))
        : nearbyFeatures;

    return <>
      <OSMImageNoteReviewActions imageNote={note} onReviewed={onClose}/>
      <OSMImageNoteVotes osmImageNote={note} onUpdate={this.fetchNote}/>
      <ErrorAlert status={error} message="Saving features failed. Try again perhaps?"/>
      {note.image && <ZoomableImage src={note.image} className="noteImage"/>}
      <>
        <p className="m-2 ml-3"><strong>Tags:</strong></p>
        <div className="m-2 ml-3">
           <OSMImageNoteTags {...{tags, mapFeatureTypes}} readOnly={!canEdit}
                             onChange={tags => this.updateSelectedNote({tags})}/>
        </div>
      </>
      <div onClick={() => canEditRelatedPlaces && this.setState({editingRelatedPlaces: true})}
           className={canEditRelatedPlaces ? "clickable": ''}>
        <div className="list-group-item">
          <strong>Related places:</strong>
          {canEditRelatedPlaces && <div className="float-right"><Icon icon={'edit'}/></div>}
          {editingRelatedPlaces &&
            <div className="float-right">
              <button className="btn btn-light btn-sm btn-compact"
                      onClick={() => this.setState({editingRelatedPlaces: false})}>
                Close <Icon icon={'close'}/>
              </button>
            </div>
          }
        </div>
        <NearbyAddressesAsOSMLoader
          location={location}
          onLoad={nearbyAddresses => this.setState({nearbyAddresses})} />
        <OSMFeaturesSelection
          location={location}
          extraFeatures={nearbyAddresses}
          onChange={this.onFeaturesSelected} readOnly={!editingRelatedPlaces}
          maxHeight={null}
          preselectedFeatureIds={(note.osm_features || []).concat(note.addresses || []).filter(f => f)}
          onFeaturesLoaded={(nearbyFeatures) => this.setState({nearbyFeatures})}
          featureActions={
            (feature: OSMFeature) =>
              feature.tags.entrance && note.osm_features && note.osm_features.includes(feature.id) &&
                <button className="btn btn-light btn-compact float-right"
                        onClick={(e) => this.linkEntrance(e, feature)}>
                  <Icon icon="link"/>
                </button>
          }/>
      </div>
      {mapFeatureTypes && this.getRelevantFeatureTypes().map((featureTypeName) =>
        <div key={featureTypeName} className="mr-2 ml-3">
            <MapFeatureSet
              schema={mapFeatureTypes[featureTypeName]}
              osmImageNote={note}
              featureTypeName={featureTypeName}
              nearbyFeatures={nearbyFeatures.concat(nearbyAddresses)}
              refreshNote={this.fetchNote}
              onSubmit={(data) => this.updateSelectedNote(data)}/>
        </div>
      )}
      <div className="m-2 ml-3">
        <p>
          <strong>Comments ({(note.comments || []).length}) </strong>
          <button className="btn btn-light btn-sm btn-compact float-right" onClick={this.fetchNote}>
            <Icon icon={'refresh'}/>
          </button>
        </p>
        <OSMImageNoteComments osmImageNote={note} refreshNote={this.fetchNote}/>
      </div>

      {linkingEntrance && <AssociateEntranceModal
        entrance={linkingEntrance}
        nearbyFeatures={relatedFeatures}
        onClose={() => this.setState({linkingEntrance: undefined})}/>}
    </>;
  }

  renderTitle() {
    const {showOnMap, requestLocation} = this.props;
    const {note, repositioning} = this.state;
    const {user} = this.context;

    if (repositioning || !note) return null;

    const canEdit = userCanEditNote(user, note);

    // @ts-ignore
    const credit = `${note.created_by ? note.created_by.username: 'Anonymous'} on ${formatTimestamp(note.created_at)}`;

    return <>
      {note.comment
        ? <>{note.comment}<br/>by {credit}</>
        : `Note by ${credit}`}
      <br/>
      {showOnMap && <span className="clickable text-primary" onClick={showOnMap}><Icon icon="place"/></span>}
      {' '}
      <span className="clickable text-primary ml-1"
              onClick={this.copyPermalink}>
        <Icon icon="link"/>
      </span>
      {' '}
      {requestLocation && canEdit &&
        <span className="clickable text-primary ml-1" onClick={this.adjustPosition}>
          <Icon icon="open_with"/>
        </span>}
      {' '}
      <a className="text-primary ml-1" target="google-maps" href={`https://maps.google.com/?layer=c&cbll=${note?.lat},${note.lon}`}>
        <span style={{fontSize: 21, marginRight: -4}}>G</span><Icon icon="place"/>
      </a>
      <a className="text-primary ml-1" target="mapillary" href={`https://www.mapillary.com/app/?lat=${note?.lat}&lng=${note.lon}&z=20&panos=true`}>
        <span style={{fontSize: 21, marginRight: -4}}>M</span><Icon icon="place"/>
      </a>
      <textarea id="permalink" value={window.location.href} style={{width: 0, height: 0, opacity: 0}} readOnly/>
    </>;
  }

  copyPermalink = () => {
    (document.getElementById('permalink') as HTMLInputElement).select();
    document.execCommand('copy');
  };

  onFeaturesSelected = (featureIds: number[], addresses?: number[]) => {
    this.updateSelectedNote({osm_features: featureIds, addresses});
  };

  updateSelectedNote(data: any, nextState?: any) {
    const {note} = this.state;
    if (!note) return;
    const url = osmImageNoteUrl(note.id as number);

    sessionRequest(url, {method: 'PATCH', data})
    .then((response) => {
      if (response.status < 300) response.json().then((note: OSMImageNote) => {
        this.setState({note, error: false});
      });
      else this.setState({error: true});
    })
  }

  fetchNote = () => {
    return sessionRequest(osmImageNoteUrl(this.props.note.id as number))
      .then(response => response.json())
      .then(note => this.setState({note}))
  };

  private getRelevantFeatureTypes() {
    const {note} = this.state;
    const {mapFeatureTypes} = this.props;
    if (!note) return [];
    const tags = note.tags || [];
    const allTags = Object.keys(mapFeatureTypes || {});
    return allTags.filter(tag => tags.includes(tag));
  }

  linkEntrance(e: React.MouseEvent, entrance: OSMFeature) {
    e.stopPropagation();
    this.setState({linkingEntrance: entrance})
  }

  adjustPosition = () => {
    const {requestLocation, note} = this.props;
    if (!requestLocation) return;
    this.setState({repositioning: true});

    const onLocationSelected = (location: any) => {
      this.updateSelectedNote(location);
      this.setState({repositioning: false});
    };
    requestLocation(onLocationSelected, note)
  };

  cancelLocationRequest = () => {
    const {cancelLocationRequest} = this.props;
    cancelLocationRequest && cancelLocationRequest();
    this.setState({repositioning: false});
  }
}
