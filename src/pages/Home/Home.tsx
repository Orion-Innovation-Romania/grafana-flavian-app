import React, { useMemo } from 'react';

import { SceneApp, SceneAppPage } from '@grafana/scenes';
import { getBasicScene } from './scenes';
import { prefixRoute } from '../../utils/utils.routing';
import { ROUTES } from '../../constants';

const getScene = () => {
  return new SceneApp({
    pages: [
      new SceneAppPage({
        title: 'Min-max Timeseries',
        subTitle:
          '',
        url: prefixRoute(ROUTES.Home),
        getScene: () => {
          return getBasicScene();
        },
      }),
    ],
  });
};

const HomePage = () => {
  const scene = useMemo(() => getScene(), []);

  return (
    <>
      <scene.Component model={scene} />
    </>
  );
};

export default HomePage;
