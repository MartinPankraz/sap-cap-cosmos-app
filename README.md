# sap-cap-cosmos-app (Prototype)
SAP Cloud Application Programming (CAP) model implementation of Azure CosmosDB OData shim integration. The cds service serves as proxy to the CloudFoundry destination and ultimately the OData services exposed by the .NET web api running in Azure, which collects data from Azure CosmosDB. The SAPUI5 part of the application is identical to the non-cap implementation [here](https://github.com/MartinPankraz/SAPUI5-CosmosDB-umbrella).

Find the related blog post on the SAP community [here]().

Find the related GitHub repos for the OData shim on Azure [here](https://github.com/MartinPankraz/AzCosmosDB-OData-Shim).

<br><br>
<img src="img/geode-pattern.png" alt="architecture" width="700"/>
<br><br>

## How to run
From your IDE run `cds watch`

## How to deploy
Login with your CloudFoundry space, run
```
mbt build
```
and finally
```
cf deploy mta_archives/cap-cosmosdb-app_1.0.0.mtar
```