import React from 'react';
import Card, {CardP} from "util_components/Card";
import MapWidget from "components/MapWidget";
import PackageDistances from "components/PackageDistances";
import ConfirmButton from "util_components/ConfirmButton";
import {Package} from "components/types";
import {LocationTuple} from "util_components/types";
import TimeInterval from "util_components/TimeInterval";
import {sessionRequest} from "sessionRequest";
import {reservePackageUrl} from "urls";
import CopyTsvWidget from "util_components/CopyTsvWidget";
import {packageAsTsv} from "components/package_cards/packageUtils";
import Contacts from "util_components/Contacts";

type AvailablePackageProps = {
    package: Package,
    currentLocation?: LocationTuple,
    onPackageUpdate: (item: Package) => any
}

export default class AvailablePackage extends React.Component<AvailablePackageProps> {
  render() {
    const {
      earliest_pickup_time, latest_pickup_time,
      earliest_delivery_time, latest_delivery_time,
      pickup_at, deliver_to, name, recipient, recipient_phone,
      weight, width, height, depth, id} = this.props.package;

    const {currentLocation} = this.props;
    const [lon, lat] = currentLocation || [];

    const title = <>
        <MapWidget origin={pickup_at} destination={deliver_to} currentPositionIndex={0}/>
        <CopyTsvWidget values={packageAsTsv(this.props.package)} className="float-right mr-2"/>
        {pickup_at.street_address} to {deliver_to.street_address}
      </>;

    return (
      <Card title={title} subtitles={[name]}>
        {(weight || width || height || depth) &&
          <CardP>{weight} kg, {width}*{height}*{depth}cm</CardP>}
        <PackageDistances package={this.props.package} courierLocation={currentLocation && {lat, lon}}/>
        <CardP>
          <TimeInterval label="Pickup" from={earliest_pickup_time} to={latest_pickup_time}/><br />
          <TimeInterval label="Delivery" from={earliest_delivery_time} to={latest_delivery_time}/>
        </CardP>
        <Contacts phone={recipient_phone} title="Recipient" name={recipient}/>
        <ConfirmButton confirm="Reserve for delivery?" onClick={this.reservePackage}>Reserve</ConfirmButton>
      </Card>
    );
  }

  reservePackage = () => {
    const {id} = this.props.package;
    sessionRequest(reservePackageUrl(id), {method: 'PUT'})
    .then((response) => {
      if (response.status == 200) response.json().then(this.props.onPackageUpdate);
      else this.setState({error: true});
    })
  };
}
