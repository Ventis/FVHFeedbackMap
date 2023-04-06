import React from "react";
import Modal, { ModalBody } from "util_components/bootstrap/Modal";
import settings from "settings.json";
import { LocationTuple } from "./types";
import { WithTranslation, withTranslation } from "react-i18next";

interface GeolocatorProps extends WithTranslation {
  onLocation: (location: LocationTuple) => any;
}
class Geolocator extends React.Component<GeolocatorProps> {
  state = {
    geolocationError: null,
  };

  geolocationWatcher: number | null = null;
  mockInterval: NodeJS.Timeout | null = null;

  render() {
    const { geolocationError } = this.state;
    const { t } = this.props;

    return geolocationError ? (
      <Modal
        title={t("Location error")}
        onClose={() => this.setState({ geolocationError: null })}
      >
        <ModalBody>
          <small>
            <p>{t("Could not access your position")}:</p>
            <p>{geolocationError}</p>
          </small>
        </ModalBody>
      </Modal>
    ) : (
      ""
    );
  }

  componentDidMount() {
    // @ts-ignore
    const useMockGeolocation = settings.useMockGeolocation;
    if (useMockGeolocation) {
      setTimeout(() => this.props.onLocation(useMockGeolocation), 500);
      this.mockInterval = setInterval(
        () => this.props.onLocation(useMockGeolocation),
        10000
      );
    } else
      this.geolocationWatcher = navigator.geolocation.watchPosition(
        (position) => {
          this.props.onLocation([
            position.coords.longitude,
            position.coords.latitude,
          ]);
        },
        (error) => this.setState({ geolocationError: error.message })
      );
  }

  componentWillUnmount() {
    if (this.geolocationWatcher)
      navigator.geolocation.clearWatch(this.geolocationWatcher);
    if (this.mockInterval) clearInterval(this.mockInterval);
    this.geolocationWatcher = null;
    this.mockInterval = null;
  }
}

export default withTranslation()(Geolocator);
