import 'package:flutter/material.dart';
import '../components/cropwise_app_bar.dart';

class FAQsPage extends StatelessWidget {
  const FAQsPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CropWiseAppBar(currentPage: 'FAQs'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Frequently Asked Questions',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 32),
            _buildFaqItem(
              'What is CropWise?',
              'CropWise is a smart farming application that helps farmers optimize their crop selection, monitor weather conditions, and improve farm management through data-driven insights and AI recommendations.',
            ),
            _buildFaqItem(
              'How does crop suggestion work?',
              'Our AI-powered system analyzes your farm\'s location, soil type, crop history, and current weather conditions to recommend the most suitable crops for your farm. The suggestions are based on historical data, scientific research, and local farming practices.',
            ),
            _buildFaqItem(
              'How accurate are the weather forecasts?',
              'We use data from multiple meteorological sources to provide accurate forecasts. Our 7-day forecast is typically 80-90% accurate, with accuracy decreasing for longer-term predictions. We update our forecasts every 3 hours to ensure you have the most current information.',
            ),
            _buildFaqItem(
              'Can I use CropWise for any size farm?',
              'Yes! CropWise is designed to work for farms of all sizes, from small family plots to large commercial operations. You can specify your farm size during setup, and our recommendations will be tailored accordingly.',
            ),
            _buildFaqItem(
              'How do I set up my farm profile?',
              'Navigate to the "My Farm" section and follow the step-by-step guide. You\'ll need to provide your location, soil type, crop history, and other relevant details. You can update this information anytime as your farm changes.',
            ),
            _buildFaqItem(
              'Are the crop suggestions region-specific?',
              'Absolutely. Our suggestions take into account your specific location, local climate patterns, and regional farming practices to ensure the recommendations are relevant and practical for your area.',
            ),
            _buildFaqItem(
              'What do the weather warnings cover?',
              'Weather warnings include alerts for extreme temperatures, heavy rainfall, drought conditions, frost, hail, and strong winds that might affect your crops. We prioritize warnings based on your current crop selection and growth stage.',
            ),
            _buildFaqItem(
              'How can I contribute to CropWise?',
              'You can contribute by providing feedback on crop suggestions, reporting actual yields, and sharing your farming experiences. This data helps improve our AI models and benefits the entire farming community.',
            ),
            _buildFaqItem(
              'Is my data secure?',
              'Yes, we take data security seriously. Your farm data and personal information are encrypted and stored securely. We do not share your individual data with third parties without your explicit consent.',
            ),
            _buildFaqItem(
              'How do I get technical support?',
              'You can reach our support team through the "Help" section in your account settings, or by emailing support@cropwise.com. We typically respond within 24 hours on business days.',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFaqItem(String question, String answer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: ExpansionTile(
        title: Text(
          question,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              answer,
              style: const TextStyle(fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }
}