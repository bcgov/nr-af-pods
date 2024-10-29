Connect-CrmOnPremDiscovery -InteractiveModeExport-CrmSolution PODSCommonCDM -Managed
Export-CrmSolution PODSModelApps -Managed
Export-CrmSolution PODSPowerPagesPortal -Managed
C:\Projects\DevOps\D365Tools\coretools\SolutionPackager /action:Extract /zipfile:PODSCommonCDM_managed_1_0_0_98.zip /folder:PODSCommonCDM/managed
C:\Projects\DevOps\D365Tools\coretools\SolutionPackager /action:Extract /zipfile:PODSModelApps_managed_1_0_0_98.zip /folder:PODSModelApps/managed
C:\Projects\DevOps\D365Tools\coretools\SolutionPackager /action:Extract /zipfile:PODSPowerPagesPortal_managed_1_0_0_98.zip /folder:PODSPowerPagesPortal/managed