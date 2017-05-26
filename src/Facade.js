import ApolloClient, { createNetworkInterface } from 'apollo-client';
import gql from 'graphql-tag';
import PouchDB from 'pouchdb';
import { getRepositoriesQuery } from './queries';

export default class Facade {
  constructor(accessToken) {
    this.apolloClient = new ApolloClient({
      networkInterface: createNetworkInterface({
        uri: 'https://api.github.com/graphql',
        opts: {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      })
    });

    this.database = new PouchDB('offline-issues');
  }

  loadRepositories() {
    return this.database.allDocs({include_docs: true})
    .then(resultSet => {
      if (resultSet.total_rows > 0) {
        return Promise.resolve(resultSet.rows.map(row => row.doc));
      } else {
        return this.apolloClient.query({
          query: gql(getRepositoriesQuery)
        })
        .then((resultSet) => this.storeRepositories(resultSet));
      }
    });
  }

  storeRepositories(resultSet) {
    const repositories = resultSet.data.viewer.repositories.nodes;

    return Promise.all(repositories.map(repository => {
      return this.database.put({
        _id: repository.id,
        name: repository.name,
        createdAt: repository.createdAt
      });
    }))
    .then(() => this.database.allDocs({include_docs: true}))
    .then((resultSet) => resultSet.rows.map(row => row.doc));
  }
}