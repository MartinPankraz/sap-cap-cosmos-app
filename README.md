# sap-cap-cosmos-app (Prototype)
SAP Cloud Application Programming (CAP) model implementation of Azure CosmosDB OData shim integration. The cds service serves as proxy to the CloudFoundry destination and ultimately the OData services exposed by the .NET web api running in Azure, which collects data from Azure CosmosDB. The SAPUI5 part of the application is identical to the non-cap implementation [here](https://github.com/MartinPankraz/SAPUI5-CosmosDB-umbrella).

Additional Resources |
--- |
[blog on the SAP community](https://blogs.sap.com/2021/06/11/sap-where-can-i-get-toilet-paper-an-implementation-of-the-geodes-pattern-with-s4-btp-and-azure-cosmosdb/) |
[OData web api project](https://github.com/MartinPankraz/AzCosmosDB-OData-Shim) |
[SAPUI5 freestyle client](https://github.com/MartinPankraz/SAPUI5-CosmosDB-umbrella) |
[CI/CD pipelines on AzDevOps](https://dev.azure.com/mapankra/CosmosDB%20OData%20SAP%20umbrella) |
<br>

![architecture](img/geode-pattern.png)

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
