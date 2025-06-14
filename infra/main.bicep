targetScope = 'resourceGroup'

@description('Location for all resources')
param location string = resourceGroup().location

@description('Environment name')
param environmentName string

@description('App name')
param appName string

@description('Container image name')
param containerImage string = 'nginx:latest'

@description('Database URL for the application')
param databaseUrl string

@description('NextAuth secret key')
param nextAuthSecret string

@description('NextAuth URL')
param nextAuthUrl string

resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${environmentName}-env'
  location: location
  properties: {
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  }
}

resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: appName
  location: location
  properties: {
    managedEnvironmentId: containerAppEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        allowInsecure: false
        traffic: [
          {
            weight: 100
            latestRevision: true
          }
        ]
      }
    }
    template: {
      containers: [
        {
          name: appName
          image: containerImage
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'DATABASE_URL'
              value: databaseUrl
            }
            {
              name: 'NEXTAUTH_SECRET'
              value: nextAuthSecret
            }
            {
              name: 'NEXTAUTH_URL'
              value: nextAuthUrl
            }
            {
              name: 'NODE_ENV'
              value: 'production'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
      }
    }
  }
}

output containerAppUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
