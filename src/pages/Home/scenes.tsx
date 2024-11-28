import {
  EmbeddedScene,
  PanelBuilders,
  SceneControlsSpacer,
  SceneFlexItem,
  SceneFlexLayout,
  SceneQueryRunner,
  SceneRefreshPicker,
  SceneTimePicker,
  SceneTimeRange,
  SceneVariableSet,
  TextBoxVariable,
  VariableValueSelectors,
} from '@grafana/scenes';
import { DATASOURCE_REF } from '../../constants';
import { CustomSceneObject } from './CustomSceneObject';

export function getBasicScene(templatised = true) {
  const timeRange = new SceneTimeRange({
    from: 'now-6h',
    to: 'now',
  });

  const minVariable = new TextBoxVariable({
    name: 'minValue',
    label: 'Min Value',
    value: '10',
  });

  const maxVariable = new TextBoxVariable({
    name: 'maxValue',
    label: 'Max Value',
    value: '100',
  });

  // Query runner definition, using Grafana built-in TestData datasource
  const queryRunner = new SceneQueryRunner({
    datasource: DATASOURCE_REF,
    queries: [
      {
        refId: 'A',
        datasource: DATASOURCE_REF,
        scenarioId: 'random_walk',
        seriesCount: 5,
        min: 10,
        max: 100,
      },
    ],
    maxDataPoints: 100,
  });

  // Custom object definition
  const customObject = new CustomSceneObject({
    counter: 5,
  });

  // Query runner activation handler that will update query runner state when custom object state changes
  queryRunner.addActivationHandler(() => {
    const sub = customObject.subscribeToState((newState) => {
      queryRunner.setState({
        queries: [
          {
            ...queryRunner.state.queries[0],
            seriesCount: newState.counter,
          },
        ],
      });
      queryRunner.runQueries();
    });

    return () => {
      sub.unsubscribe();
    };
  });

  queryRunner.addActivationHandler(() => {
    const minVal = minVariable.subscribeToState((newState) => {
      queryRunner.setState({
        queries: [
          {
            ...queryRunner.state.queries[0],
            min: parseInt(newState.value),
          },
        ],
      });
      queryRunner.runQueries();
    });

    return () => {
      minVal.unsubscribe();
    };
  });

  queryRunner.addActivationHandler(() => {
    const maxVal = maxVariable.subscribeToState((newState) => {
      queryRunner.setState({
        queries: [
          {
            ...queryRunner.state.queries[0],
            max: parseInt(newState.value),
          },
        ],
      });
      queryRunner.runQueries();
    });

    return () => {
      maxVal.unsubscribe();
    };
  });

  return new EmbeddedScene({
    $timeRange: timeRange,
    $variables: new SceneVariableSet({ variables: templatised ? [minVariable, maxVariable] : [] }),
    $data: queryRunner,
    body: new SceneFlexLayout({
      children: [
        new SceneFlexItem({
          minHeight: 300,
          body: PanelBuilders.timeseries()
            // Title is using variable value
            .setTitle('Min-Max Timeseries')
            .build(),
        }),
      ],
    }),
    controls: [
      new VariableValueSelectors({}),
      new SceneControlsSpacer(),
      customObject,
      new SceneTimePicker({ isOnCanvas: true }),
      new SceneRefreshPicker({
        intervals: ['5s', '1m', '1h'],
        isOnCanvas: true,
      }),
    ],
  });
}
