Connect-CrmOnPremDiscovery -InteractiveMode
Export-CrmSolution PODSCommonCDM -Managed
C:\Projects\DevOps\D365Tools\coretools\SolutionPackager /action:Extract /zipfile:PODSCommonCDM_managed_1_0_0_99.zip /folder:PODSCommonCDM/managed

Export-CrmSolution PODSCommonCDM -Unmanaged
C:\Projects\DevOps\D365Tools\coretools\SolutionPackager /action:Extract /zipfile:PODSCommonCDM_1_0_0_99.zip /folder:PODSCommonCDM/Unmanaged


Export-CrmSolution PODSModelApps -Managed
C:\Projects\DevOps\D365Tools\coretools\SolutionPackager /action:Extract /zipfile:PODSModelApps_managed.zip /folder:PODSModelApps/managed

Export-CrmSolution PODSModelApps -Unmanaged
C:\Projects\DevOps\D365Tools\coretools\SolutionPackager /action:Extract /zipfile:PODSModelApps_1_0_0_99.zip /folder:PODSModelApps/Unmanaged


Export-CrmSolution PODSPowerPagesPortal -Managed
C:\Projects\DevOps\D365Tools\coretools\SolutionPackager /action:Extract /zipfile:PODSPowerPagesPortal_managed.zip /folder:PODSPowerPagesPortal/managed

Export-CrmSolution PODSPowerPagesPortal -Unmanaged
C:\Projects\DevOps\D365Tools\coretools\SolutionPackager /action:Extract /zipfile:PODSPowerPagesPortal_1_0_0_99.zip /folder:PODSPowerPagesPortal/Unmanaged