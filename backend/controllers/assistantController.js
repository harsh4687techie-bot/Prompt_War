// ====================================================
// VOTEGUIDE AI — Assistant Controller (Smart Logic)
// ====================================================

const { validateAge, validateLocation } = require('../utils/helpers');

/**
 * POST /api/assistant
 * Decision logic based on user data
 *
 * Body: { age, location, registered }
 * Returns structured JSON with eligibility, steps, and recommendations
 */
async function processAssistant(req, res) {
  try {
    const { age, location, registered } = req.body;

    // --- Validate age ---
    const ageResult = validateAge(age);
    if (!ageResult.valid) {
      return res.status(400).json({
        success: false,
        error: ageResult.error,
      });
    }

    // --- Validate location (optional but recommended) ---
    let cleanLocation = '';
    if (location) {
      const locResult = validateLocation(location);
      if (!locResult.valid) {
        return res.status(400).json({
          success: false,
          error: locResult.error,
        });
      }
      cleanLocation = locResult.value;
    }

    const userAge = ageResult.value;

    // =============================================
    // SMART DECISION LOGIC
    // =============================================

    // Case 1: Under 18 — not eligible in India
    if (userAge < 18) {
      const yearsUntil = 18 - userAge;
      return res.json({
        success: true,
        decision: 'underage',
        data: {
          eligible: false,
          age: userAge,
          yearsUntilEligible: yearsUntil,
          message: `In India, the minimum voting age is 18. You're currently ${userAge} years old. You'll be eligible to vote in ${yearsUntil} year${yearsUntil !== 1 ? 's' : ''}.`,
          recommendations: [
            'Learn about the democratic process and the Election Commission of India early',
            'Stay informed about local and national issues',
            'Encourage eligible friends and family to vote',
          ],
          canPreRegister: false, // Pre-registration not generally applicable in India like US
        },
      });
    }

    // Case 2: Eligible but not registered
    if (registered === false) {
      return res.json({
        success: true,
        decision: 'not_registered',
        data: {
          eligible: true,
          registered: false,
          age: userAge,
          location: cleanLocation,
          message: `You're eligible to vote! Let's get you registered via the NVSP portal.`,
          registrationSteps: [
            'Visit the National Voter\'s Service Portal (nvsp.in) or voters.eci.gov.in',
            'Select "Fill Form 6" for new voter registration',
            'Prepare your documents: Age proof (Birth Certificate, 10th Marksheet, PAN) and Address proof (Aadhaar, Passport, Utility Bill)',
            'Upload a recent passport-size photograph',
            'Submit your application and note down the reference ID to track status',
          ],
          resources: [
            { label: 'NVSP Portal', url: 'https://www.nvsp.in/' },
            { label: 'Voters Portal (ECI)', url: 'https://voters.eci.gov.in/' },
          ],
          nextStep: 'registration',
        },
      });
    }

    // Case 3: Registered — ready to vote
    return res.json({
      success: true,
      decision: 'registered',
      data: {
        eligible: true,
        registered: true,
        age: userAge,
        location: cleanLocation,
        message: `Great! You're registered and ready to vote. Let's make sure you have everything ready.`,
        votingSteps: [
          'Verify your name in the electoral roll using your Voter ID (EPIC) number',
          'Find your polling booth location on the NVSP portal or Voter Helpline app',
          'Download and print your Voter Information Slip',
          'Bring your original Voter ID (EPIC) or other approved photo ID (like Aadhaar or PAN) to the booth',
          'Follow instructions at the booth and cast your vote on the EVM',
        ],
        checklist: [
          { item: 'Voter ID (EPIC) or approved photo ID', checked: false },
          { item: 'Voter Information Slip', checked: false },
          { item: 'Verified polling booth location', checked: false },
        ],
        resources: [
          { label: 'Find Polling Booth', url: `https://www.google.com/maps/search/polling+booth+near+me+${encodeURIComponent(cleanLocation ? cleanLocation + ' India' : 'India')}` },
          { label: 'Search in Electoral Roll', url: 'https://electoralsearch.eci.gov.in/' },
        ],
        nextStep: 'voting',
      },
    });

  } catch (err) {
    console.error('[Assistant] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.',
    });
  }
}

module.exports = { processAssistant };
