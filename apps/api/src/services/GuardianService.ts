import axios from 'axios';

export interface VerifiableCredential {
  '@context': string[];
  type: string[];
  credentialSubject: {
    userAccountId: string;
    tripType: string;
    distance: number;
    avgSpeed: number;
    greenTokensEarned: number;
    co2Saved: number;
    verificationDate: string;
    status: string;
  };
  issuer: {
    id: string;
    name: string;
  };
  issuanceDate: string;
  expirationDate?: string;
}

export class GuardianService {
  private baseUrl: string;
  private policyId?: string;

  constructor() {
    this.baseUrl = process.env.GUARDIAN_API_URL || 'https://testnet.guardianapi.hedera.com';
    this.policyId = process.env.GUARDIAN_POLICY_ID;
  }

  async submitTripForVerification(tripData: any): Promise<{ success: boolean; vcId?: string; message: string }> {
    try {
      const mockVC: VerifiableCredential = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://schema.org/',
          'https://greenhop.com/contexts/v1'
        ],
        type: ['VerifiableCredential', 'GreenHopTripCredential'],
        credentialSubject: {
          userAccountId: tripData.userAccountId,
          tripType: tripData.tripType,
          distance: tripData.distance,
          avgSpeed: tripData.avgSpeed,
          greenTokensEarned: Math.floor((tripData.distance / 1000) * (tripData.tripType === 'cycling' ? 1.5 : 1)),
          co2Saved: Math.round((tripData.distance / 1000) * 0.12 * 1000),
          verificationDate: new Date().toISOString(),
          status: 'verified'
        },
        issuer: {
          id: 'did:hedera:testnet:guardian',
          name: 'GreenHop Verification Service'
        },
        issuanceDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      // const response = await axios.post(`${this.baseUrl}/policies/${this.policyId}/documents`, tripData);
      
      console.log('Mock VC created:', mockVC);
      
      return {
        success: true,
        vcId: `vc-${Date.now()}`,
        message: 'Trip verified and Verifiable Credential issued'
      };

    } catch (error) {
      console.error('Error submitting trip to Guardian:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getVerifiableCredential(vcId: string): Promise<VerifiableCredential | null> {
    try {
      return null;
    } catch (error) {
      console.error('Error fetching VC:', error);
      return null;
    }
  }

  async validateCredential(vc: VerifiableCredential): Promise<boolean> {
    try {
      return vc.credentialSubject.status === 'verified';
    } catch (error) {
      console.error('Error validating VC:', error);
      return false;
    }
  }
}