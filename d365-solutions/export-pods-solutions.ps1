Connect-CrmOnPremDiscovery -InteractiveMode
Export-CrmSolution PODSCommonCDM -Managed
C:\Projects\DevOps\D365Tools\coretools\SolutionPackager /action:Extract /zipfile:PODSCommonCDM_managed_1_0_0_100.zip /folder:PODSCommonCDM/managed

#Export-CrmSolution PODSCommonCDM
#C:\Projects\DevOps\D365Tools\coretools\SolutionPackager /action:Extract /zipfile:PODSCommonCDM_1_0_0_100.zip /folder:PODSCommonCDM/Unmanaged


Export-CrmSolution PODSModelApps -Managed
C:\Projects\DevOps\D365Tools\coretools\SolutionPackager /action:Extract /zipfile:PODSModelApps_managed.zip /folder:PODSModelApps/managed

#Export-CrmSolution PODSModelApps
#C:\Projects\DevOps\D365Tools\coretools\SolutionPackager /action:Extract /zipfile:PODSModelApps_1_0_0_100.zip /folder:PODSModelApps/Unmanaged


Export-CrmSolution PODSPowerPagesPortal -Managed
C:\Projects\DevOps\D365Tools\coretools\SolutionPackager /action:Extract /zipfile:PODSPowerPagesPortal_managed.zip /folder:PODSPowerPagesPortal/managed

#Export-CrmSolution PODSPowerPagesPortal
#C:\Projects\DevOps\D365Tools\coretools\SolutionPackager /action:Extract /zipfile:PODSPowerPagesPortal_1_0_0_100.zip /folder:PODSPowerPagesPortal/Unmanaged