import React from "react";
import { AppContext, MapDataPoint } from "components/types";
import Icon from "util_components/bootstrap/Icon";

import Confirm from "util_components/bootstrap/Confirm";
import sessionRequest from "sessionRequest";
import { rejectMapDataPointUrl, processedMapDataPointUrl } from "urls";
import { userCanEditNote } from "components/map_data_points/utils";
import { WithTranslation, withTranslation } from "react-i18next";

interface ReviewActionsProps extends WithTranslation {
  mapDataPoint: MapDataPoint;
  onProcessed: () => any;
}

type ReviewActionsState = {
  confirmProcessed: boolean;
  confirmReject: boolean;
};

const initialState: ReviewActionsState = {
  confirmProcessed: false,
  confirmReject: false,
};

class MapDataPointReviewActions extends React.Component<
  ReviewActionsProps,
  ReviewActionsState
> {
  static contextType = AppContext;
  state = initialState;

  render() {
    const { mapDataPoint, t } = this.props;
    const { confirmProcessed, confirmReject } = this.state;
    const { user } = this.context as any;
    const canEdit = userCanEditNote(user, mapDataPoint);

    return (
      canEdit && (
        <>
          <h6 className="dropdown-header">{t("Mark note as")}:</h6>
          {!mapDataPoint.is_processed && user && user.is_reviewer && (
            <button
              className="dropdown-item"
              onClick={() => this.setState({ confirmProcessed: true })}
            >
              <Icon icon="map" /> {t("Processed")}
            </button>
          )}

          {confirmProcessed && (
            <Confirm
              title={t("Mark this data point as processed?")}
              onClose={() => this.setState({ confirmProcessed: false })}
              onConfirm={this.onProcessed}
            />
          )}

          {canEdit && (
            <button
              className="dropdown-item"
              onClick={() => this.setState({ confirmReject: true })}
            >
              <Icon icon="delete" /> {t("Rejected")}
            </button>
          )}

          {confirmReject && (
            <Confirm
              title={t(
                "Mark this data point as rejected, hiding it from view on the map?"
              )}
              onClose={() => this.setState({ confirmReject: false })}
              inputPlaceholder={t(
                "Please write here shortly the reason for the rejection."
              )}
              onConfirm={this.onReject}
            />
          )}
        </>
      )
    );
  }

  registerAction = (url: string, data?: any) => {
    const { mapDataPoint, onProcessed } = this.props;
    sessionRequest(url, { method: "PUT", data }).then((response) => {
      if (response.status < 300) {
        mapDataPoint.is_processed = true; // Modifying the props directly, because we operate on the dark side here.
        onProcessed();
      }
    });
  };

  onProcessed = () => {
    this.registerAction(
      processedMapDataPointUrl(this.props.mapDataPoint.id as number)
    );
  };

  onReject = (hidden_reason?: string) => {
    this.registerAction(
      rejectMapDataPointUrl(this.props.mapDataPoint.id as number),
      { hidden_reason }
    );
  };
}

export default withTranslation()(MapDataPointReviewActions);
