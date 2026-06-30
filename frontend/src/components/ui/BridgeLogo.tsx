import { BridgeLogo as MainLogo } from './bridge-logo'

interface BridgeLogoProps {
  className?: string
}

export function BridgeLogo({ className }: BridgeLogoProps) {
  return <MainLogo className={className} />
}
