import React from 'react';
import sessionRequest from "sessionRequest";
import {mapDataPointsUrl} from "urls";
import {MapDataPoint, Tag} from "components/types";
import Geolocator from "util_components/Geolocator";
import {Location} from "util_components/types";
import MapDataPointModal from "components/map_data_points/MapDataPointModal";
import {getTags} from "components/map_data_points/utils";
import { withTranslation, WithTranslation } from 'react-i18next';

type TagButtonsState = {
  tags?: Tag[],
  currentPosition?: Location,
  dataPoint?: MapDataPoint
}

const initialState: TagButtonsState = {};

class TagButtons extends React.Component<WithTranslation, TagButtonsState> {
  state = initialState;

  componentDidMount() {
    getTags.then(tags => this.setState({tags}));
  }

  render() {
    const { t, i18n } = this.props;
    const {tags, dataPoint} = this.state;
    const maxHeight = !tags ? 0 : Math.round(40 / tags.length) + 'vh';
    return !tags ? '' : <div className="container-fluid" style={{height: '100%'}}>
      <Geolocator onLocation={([lon, lat]) => this.setState({currentPosition: {lat, lon}})}/>
      <div className="row" style={{height: '100%'}}>
        {tags.map(({tag, icon, color}) =>
          <div className="col-6 d-flex" key={tag}>
            <button className={`btn btn-${color} mb-3 mt-3 btn-block btn-lg`} onClick={() => this.newPoint(tag)}>
              {icon && <><img src={icon} style={{maxHeight, maxWidth: 480}}/><br/></>}
              {i18n.exists(`tags.${tag}`) ? t(`tags.${tag}`) : tag }
            </button>
          </div>)}
      </div>
      {dataPoint && <MapDataPointModal onClose={() => this.setState({dataPoint: undefined})} note={dataPoint}/>}
    </div>;
  }

  newPoint(tag: string) {
    const {currentPosition} = this.state;
    if (!currentPosition) return;
    const {lat, lon} = currentPosition;
    sessionRequest(mapDataPointsUrl, {method: 'POST', data: {lat, lon, tags: [tag]}})
    .then(response => response.json())
    .then((dataPoint) => this.setState({dataPoint}))
  }
}

export default withTranslation()(TagButtons);