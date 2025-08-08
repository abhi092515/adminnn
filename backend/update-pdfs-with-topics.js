const BASE_URL = 'http://localhost:5912/api';

async function updatePdfsWithTopicsAndSections() {
  try {
    console.log('🔧 Updating PDFs with Topics and Sections...\n');

    // PDF assignments with logical topics and sections
    const pdfUpdates = [
      {
        id: "682db71d174c11b7a3bc8386",
        title: "Introductionv",
        newTitle: "Grammar Fundamentals - Basics",
        description: "A comprehensive guide to English grammar fundamentals",
        sectionId: "683def9c2f4523ef6c8b1899", // English Language
        topicId: "683def9c2f4523ef6c8b18a3"     // Grammar Essentials
      },
      {
        id: "682db72a174c11b7a3bc8397",
        title: "Introductionvv", 
        newTitle: "Algebra Concepts and Formulas",
        description: "Essential algebra concepts for competitive exams",
        sectionId: "683def9c2f4523ef6c8b1896", // Quantitative Aptitude
        topicId: "683def9c2f4523ef6c8b189e"     // Algebra Fundamentals
      },
      {
        id: "682db760174c11b7a3bc83a3",
        title: "Introductionvvv",
        newTitle: "Reading Comprehension Strategies", 
        description: "Advanced techniques for reading comprehension",
        sectionId: "683def9c2f4523ef6c8b1899", // English Language
        topicId: "683def9c2f4523ef6c8b18a4"     // Reading Comprehension
      },
      {
        id: "682eeb22973b14b7ad3552d8",
        title: "Introduction to Quantum Physics",
        newTitle: "Data Interpretation Techniques",
        description: "Methods and shortcuts for data interpretation problems",
        sectionId: "683def9c2f4523ef6c8b1896", // Quantitative Aptitude  
        topicId: "683def9c2f4523ef6c8b18a0"     // Data Interpretation
      }
    ];

    for (const update of pdfUpdates) {
      console.log(`📝 Updating PDF: ${update.title} -> ${update.newTitle}`);
      
      try {
        const response = await fetch(`${BASE_URL}/pdfs/${update.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: update.newTitle,
            description: update.description,
            section: update.sectionId,
            topic: update.topicId
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ Successfully updated "${update.newTitle}"`);
          console.log(`   📍 Section: ${getSectionName(update.sectionId)}`);
          console.log(`   🎯 Topic: ${getTopicName(update.topicId)}`);
        } else {
          const errorData = await response.json();
          console.log(`   ❌ Failed to update "${update.title}":`, errorData.msg || 'Unknown error');
        }
      } catch (error) {
        console.log(`   ❌ Error updating "${update.title}":`, error.message);
      }
      
      console.log(''); // Empty line for readability
    }

    console.log('🎉 PDF updates completed!\n');
    
    // Now test the grouping functionality
    console.log('📋 Testing PDF grouping by topics...');
    const testCourseId = '683def9c2f4523ef6c8b18b7'; // SSC CGL English Mastery
    
    const groupedResponse = await fetch(`${BASE_URL}/courses/${testCourseId}/pdfs?groupBy=topic`);
    if (groupedResponse.ok) {
      const groupedData = await groupedResponse.json();
      console.log('\n📊 PDFs grouped by topics:');
      console.log(JSON.stringify(groupedData, null, 2));
    } else {
      console.log('❌ Failed to test grouping functionality');
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

// Helper functions to get readable names
function getSectionName(sectionId) {
  const sections = {
    "683def9c2f4523ef6c8b1896": "Quantitative Aptitude",
    "683def9c2f4523ef6c8b1897": "Reasoning Ability", 
    "683def9c2f4523ef6c8b1898": "General Awareness",
    "683def9c2f4523ef6c8b1899": "English Language",
    "683def9c2f4523ef6c8b189a": "History",
    "683def9c2f4523ef6c8b189b": "Geography"
  };
  return sections[sectionId] || 'Unknown Section';
}

function getTopicName(topicId) {
  const topics = {
    "683def9c2f4523ef6c8b189e": "Algebra Fundamentals",
    "683def9c2f4523ef6c8b189f": "Geometry Basics", 
    "683def9c2f4523ef6c8b18a0": "Data Interpretation",
    "683def9c2f4523ef6c8b18a1": "Logical Puzzles",
    "683def9c2f4523ef6c8b18a2": "Current Affairs 2024",
    "683def9c2f4523ef6c8b18a3": "Grammar Essentials",
    "683def9c2f4523ef6c8b18a4": "Reading Comprehension", 
    "683def9c2f4523ef6c8b18a5": "Ancient Indian History",
    "683def9c2f4523ef6c8b18a6": "Physical Geography"
  };
  return topics[topicId] || 'Unknown Topic';
}

// Run the script
updatePdfsWithTopicsAndSections();
