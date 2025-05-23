import { InjectionToken } from '@angular/core';
import {
  combineReducers,
  ActionReducer,
  ActionReducerMap,
  MetaReducer,
  createSelector,
} from '@ngrx/store';

import { environment } from '../../../../environments/environment';

import * as fromLayout from './layout/layout.reducer';
import * as fromQuery from './query/query.reducer';
import * as fromAuthorization from './authorization/authorization.reducer';
import * as fromHeaders from './headers/headers.reducer';
import * as fromVariables from './variables/variables.reducer';
import * as fromDialogs from './dialogs/dialogs.reducer';
import * as fromGqlSchema from './gql-schema/gql-schema.reducer';
import * as fromDocs from './docs/docs.reducer';
import * as fromWindows from './windows/windows.reducer';
import * as fromHistory from './history/history.reducer';
import * as fromWindowsMeta from './windows-meta/windows-meta.reducer';
import * as fromSettings from './settings/settings.reducer';
import * as fromDonation from './donation/donation.reducer';
import * as fromCollection from './collection/collection.reducer';
import * as fromCollectionsMeta from './collections-meta/collections-meta.reducer';
import * as fromEnvironments from './environments/environments.reducer';
import * as fromStream from './stream/stream.reducer';
import * as fromPreRequest from './pre-request/pre-request.reducer';
import * as fromPostRequest from './post-request/post-request.reducer';
import * as fromLocal from './local/local.reducer';
import * as fromAccount from './account/account.reducer';
import * as fromWorkspace from './workspace/workspace.reducer';
import { debug } from '../utils/logger';
import { asyncStorageSync } from './async-storage-sync';
import { localStorageSyncConfig } from './local-storage-sync-config';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { AllActions } from './action';
import { selectWindowState, windowHasUnsavedChanges } from './windows/selectors';
import { getQueryState } from './query/selectors';
import { selectCollections } from './collection/selectors';
import { str } from '../utils';

export const getPerWindowReducer = () => {
  const perWindowReducers = {
    authorization: fromAuthorization.authorizationReducer,
    layout: fromLayout.layoutReducer,
    query: fromQuery.queryReducer,
    headers: fromHeaders.headerReducer,
    variables: fromVariables.variableReducer,
    dialogs: fromDialogs.dialogReducer,
    schema: fromGqlSchema.gqlSchemaReducer,
    docs: fromDocs.docsReducer,
    history: fromHistory.historyReducer,
    stream: fromStream.streamReducer,
    preRequest: fromPreRequest.preRequestReducer,
    postRequest: fromPostRequest.postRequestReducer,
    windowId: (_ = '') => _,
  };

  return perWindowReducers;
};

// Meta reducer to log actions
export function log(
  _reducer: ActionReducer<any, AllActions>
): ActionReducer<any, AllActions> {
  return (state: RootState, action: AllActions) => {
    if (!environment.production || (window as any).__ENABLE_DEBUG_MODE__) {
      debug.log(action.type, action);
    }
    (window as any).__LAST_ACTION__ = (window as any).__LAST_ACTION__ || [];
    (window as any).__LAST_ACTION__.push(action.type);
    if (environment.production && (window as any).__LAST_ACTION__.length > 10) {
      (window as any).__LAST_ACTION__.shift();
    }

    return _reducer(state, action);
  };
}

export function asyncStorageSyncReducer(
  _reducer: ActionReducer<RootState, AllActions>
): ActionReducer<RootState, AllActions> {
  return asyncStorageSync(localStorageSyncConfig)(_reducer);
}

export const metaReducers: MetaReducer<RootState, AllActions>[] = [
  asyncStorageSyncReducer,
  // !environment.production ? storeFreeze : null,
  log,
];

export const getReducer = (): ActionReducerMap<RootState, AllActions> => {
  return {
    windows: fromWindows.windows(combineReducers(getPerWindowReducer())),
    windowsMeta: fromWindowsMeta.windowsMetaReducer,
    settings: fromSettings.settingsReducer,
    donation: fromDonation.donationReducer,
    collection: fromCollection.collectionReducer,
    collectionsMeta: fromCollectionsMeta.collectionsMetaReducer,
    environments: fromEnvironments.environmentsReducer,
    local: fromLocal.localReducer,
    account: fromAccount.accountReducer,
    workspaces: fromWorkspace.workspaceReducer,
  };
};

export const reducerToken = new InjectionToken<ActionReducerMap<RootState>>(
  'Registered Reducers'
);

export const reducerProvider = [{ provide: reducerToken, useValue: getReducer() }];

export * from './query/selectors';
export * from './docs/selectors';
export * from './headers/selectors';
export * from './variables/selectors';
export * from './layout/selectors';
export * from './gql-schema/selectors';
export * from './collection/selectors';
export * from './collections-meta/selectors';
export * from './pre-request/selectors';
export * from './post-request/selectors';
export * from './stream/selectors';
export * from './local/selectors';
export * from './account/selectors';
export * from './workspace/selectors';
export * from './environments/selectors';
export * from './authorization/selectors';
export * from './windows/selectors';
export * from './dialogs/selectors';

export const selectHasUnsavedChanges = (windowId: string) => {
  return createSelector(
    selectWindowState(windowId),
    selectCollections,
    (windowState, collections) => {
      return windowHasUnsavedChanges(windowState, collections);
    }
  );
};
