import React from 'react';

// @ts-ignore
import Form from "react-jsonschema-form";

import {AppContext, JSONSchema, MapFeature, OSMImageNote, WorkplaceEntrance} from "components/types";
// @ts-ignore
import {Button} from "reactstrap";
import {OSMFeature} from "util_components/osm/types";
import ConfirmButton from "util_components/bootstrap/ConfirmButton";
import {userCanEditNote} from "components/osm_image_notes/utils";
import WorkplaceTypeWidget from "components/map_features/WorkplaceTypeWidget";
import Modal from "util_components/bootstrap/Modal";
import WorkplaceEntranceEditor from "components/map_features/WorkplaceEntranceEditor";

type MapFeatureSetProps = {
  schema: JSONSchema,
  onSubmit: (data: any) => any,
  osmFeatureName: string,
  osmImageNote: OSMImageNote,
  nearbyFeatures: OSMFeature[],
  refreshNote?: () => any
}

type MapFeatureSetState = {
  editingFeature?: MapFeature,
  editingWorkplaceEntrance?: WorkplaceEntrance,
  entranceWP?: MapFeature
}

const initialState: MapFeatureSetState = {
  editingFeature: undefined
};

type AnyObject = {[key: string]: any};

const customWidgets: AnyObject = {
  Workplace: {type: WorkplaceTypeWidget}
};

const omitFields: AnyObject = {
  UnloadingPlace: ['entrances']
};

export default class MapFeatureSet extends React.Component<MapFeatureSetProps, MapFeatureSetState> {
  state: MapFeatureSetState = initialState;

  static contextType = AppContext;

  static defaultProps = {
    osmImageNote: {},
    nearbyFeatures: []
  };

  render() {
    const {schema, osmFeatureName, osmImageNote, refreshNote} = this.props;
    const {user} = this.context;
    const editable = userCanEditNote(user, osmImageNote);
    const {editingFeature, editingWorkplaceEntrance, entranceWP} = this.state;
    // @ts-ignore
    const mapFeatures = (osmImageNote[(this.getFeatureListFieldName())] || []) as MapFeature[];

    const filteredSchema = {...schema};
    filteredSchema.properties = omitFields[osmFeatureName] ? Object.fromEntries(
      Object.entries(schema.properties).filter(([k, v]) => !omitFields[osmFeatureName].includes(k))
    ) : schema.properties;

    return <>
      {mapFeatures.map((mapFeature, i) =>
        <div key={mapFeature.id || i}>
          <p className="mt-2">
            <strong>{osmFeatureName}</strong>
            {(mapFeature != editingFeature) &&
              <>
                {' '}
                {editable &&
                  <Button size="sm" color="primary" outline className="btn-compact"
                          onClick={() => this.setState({editingFeature: mapFeature})}>Edit</Button>
                }
                {' '}
                {mapFeature.as_osm_tags &&
                  <Button size="sm" color="secondary" outline className="btn-compact"
                          onClick={() => this.copyText((mapFeature.id || i) + '-osm-text')}>Copy</Button>
                }
                {editable &&
                  <ConfirmButton onClick={() => this.onDelete(mapFeature)}
                                 className="btn-outline-danger btn-compact btn-sm float-right"
                                 confirm={`Really delete ${osmFeatureName}?`}>Delete</ConfirmButton>
                }
              </>
            }
          </p>
          {(mapFeature === editingFeature) ?
            <Form schema={filteredSchema} uiSchema={this.getUISchema()} className="compact"
                  formData={mapFeature}
                  onSubmit={this.onSubmit}>
              <Button size="sm" color="primary" type="submit" className="btn-compact pl-4 pr-4 mr-2">Save</Button>
              <Button tag="span" size="sm" color="secondary" outline className="btn-compact pl-4 pr-4"
                      onClick={this.onCancel}>Cancel</Button>
              <ConfirmButton onClick={() => this.onDelete(mapFeature)}
                             className="btn-outline-danger btn-compact btn-sm float-right"
                             confirm={`Really delete ${osmFeatureName}?`}>Delete</ConfirmButton>
            </Form>
            :
            <>
              {mapFeature.as_osm_tags &&
              <textarea id={(mapFeature.id || i) + '-osm-text'}
                        rows={Object.keys(mapFeature.as_osm_tags).length}
                        className="form-control"
                        readOnly
                        value={Object.entries(mapFeature.as_osm_tags).map(([k, v]) => `${k}=${v}`).join('\n')}/>
              }
            </>
          }
          {osmFeatureName == 'Workplace' && <div className="mb-4 mt-1">
            {mapFeature.workplace_entrances.map((we: WorkplaceEntrance, i: number) =>
              <Button size="sm" color="primary" outline className="btn-compact" key={we.id}
                      onClick={() => this.setState({editingWorkplaceEntrance: we, entranceWP: mapFeature})}>
                Linked entrance {i + 1}
              </Button>
            )}{' '}
            {editable && !editingFeature &&
              <Button size="sm" color="primary" outline className="btn-compact"
                      onClick={() => this.editNewWPEntrance(mapFeature)}>Link entrance</Button>
            }
          </div>}

        </div>
      )}
      {editable && !editingFeature &&
        <p className="mt-2">
          <Button size="sm" color="primary" outline className="btn-compact" onClick={this.newMapFeature}>
            New {osmFeatureName}
          </Button>
        </p>
      }
      {editingWorkplaceEntrance && entranceWP &&
        <Modal onClose={() => this.setState({editingWorkplaceEntrance: undefined})}
               title={entranceWP.name + ': link entrance'}>
          <WorkplaceEntranceEditor
            workplace={entranceWP}
            workplaceEntrance={editingWorkplaceEntrance}
            imageNote={osmImageNote}
            onSubmit={() => {
              refreshNote && refreshNote();
              this.setState({editingWorkplaceEntrance: undefined})}}/>
        </Modal>
      }
    </>
  }

  private onCancel = () => {
    const {osmImageNote} = this.props;
    const {editingFeature} = this.state;
    const fieldName = this.getFeatureListFieldName();
    // @ts-ignore
    const featureList = osmImageNote[fieldName];
    // @ts-ignore
    if (!editingFeature.id) featureList.splice(featureList.indexOf(editingFeature, 1));
    this.setState({editingFeature: undefined})
  };

  onDelete = (feature: MapFeature) => {
    const {osmImageNote, onSubmit} = this.props;
    const fieldName = this.getFeatureListFieldName();
    // @ts-ignore
    const featureList = osmImageNote[fieldName];
    // @ts-ignore
    featureList.splice(featureList.indexOf(feature), 1);
    // @ts-ignore
    Promise.resolve(onSubmit({[fieldName]: featureList}))
      .then(() => {if (feature == this.state.editingFeature) this.setState({editingFeature: undefined})});
  };

  newMapFeature = () => {
    const {osmImageNote, nearbyFeatures, schema} = this.props;
    const listFieldName = this.getFeatureListFieldName();
    // @ts-ignore
    const mapFeatures = (osmImageNote[listFieldName] || []) as MapFeature[];
    const selectedFeatureIds = osmImageNote.osm_features || [];
    const selectedFeatures = nearbyFeatures.filter((f) => selectedFeatureIds.includes(f.id));

    const newMapFeature: {[k: string]: any} = {};

    if (schema.properties.street && schema.properties.housenumber) {
      const f = selectedFeatures.find(f => f.tags['addr:housenumber'] && f.tags['addr:street']);
      if (f) {
        newMapFeature.street = f.tags['addr:street'];
        newMapFeature.housenumber = f.tags['addr:housenumber'];
      }
    }

    if (schema.properties.name) {
      const f = selectedFeatures.find(f => f.tags['name']);
      if (f) {
        newMapFeature.name = f.tags['name'];
      }
    }

    mapFeatures.push(newMapFeature);
    // @ts-ignore
    osmImageNote[listFieldName] = mapFeatures;
    this.setState({editingFeature: newMapFeature});
  };

  private copyText(osmTextId: string) {
    (document.getElementById(osmTextId) as HTMLInputElement).select();
    document.execCommand('copy');
  }

  private getFeatureListFieldName() {
    return `${this.props.osmFeatureName.toLowerCase()}_set`;
  }

  onSubmit = (data: any) => {
    const {onSubmit, osmImageNote} = this.props;
    const {editingFeature} = this.state;
    const fieldName = this.getFeatureListFieldName();

    Object.assign(editingFeature, data.formData);

    // @ts-ignore
    Promise.resolve(onSubmit({[fieldName]: osmImageNote[fieldName]}))
      .then(() => this.setState({editingFeature: undefined}));
  };

  private getUISchema() {
    const {schema, osmFeatureName} = this.props;
    const radioFields = Object.entries(schema.properties)
      .filter(([field, spec]) =>
        // @ts-ignore
        String(spec.type) == String(["boolean", "null"]))
      .map(([field, spec]) => {
        // @ts-ignore
        return [field, {"ui:widget": "radio"}]
      });
    const customWidgetsForSchema = customWidgets[osmFeatureName] || {};
    const customFields = Object.entries(schema.properties)
      .filter(([field, spec]) => customWidgetsForSchema[field])
      .map(([field, spec]) => {
        return [field, {"ui:widget": customWidgetsForSchema[field]}]
      });
    const textFields = Object.entries(schema.properties)
        // @ts-ignore
      .filter(([field, spec]) => spec.type == 'string' && !spec.maxLength && !spec.enum)
      .map(([field, spec]) => {
        return [field, {"ui:widget": 'textarea'}]
      });
    return Object.fromEntries(radioFields.concat(customFields).concat(textFields));
  }

  editNewWPEntrance(workplace: MapFeature) {
    this.setState({editingWorkplaceEntrance: {workplace: workplace.id}, entranceWP: workplace});
  }
}
