import 'package:flutter/material.dart';
import '../components/cropwise_app_bar.dart';

class WeatherWarningsPage extends StatefulWidget {
  const WeatherWarningsPage({Key? key}) : super(key: key);

  @override
  State<WeatherWarningsPage> createState() => _WeatherWarningsPageState();
}

class _WeatherWarningsPageState extends State<WeatherWarningsPage> {
  bool _hasWarnings = true;
  String _selectedLocation = 'Bendigo, Victoria';
  
  // This would normally come from an API
  final List<Map<String, dynamic>> _warningsList = [
    {
      'time': 'Wed 4:16PM AWST',
      'state': 'WA',
      'description': 'Strong Wind Warning for Gascoyne and Geraldton coasts',
      'icon': Icons.waves,
    },
    {
      'time': 'Wed 3:17PM AWST',
      'state': 'WA',
      'description': 'Tropical Cyclone Technical Bulletin',
      'icon': Icons.cyclone,
    },
    {
      'time': 'Wed 5:15PM AEST',
      'state': 'NSW/ACT',
      'description': 'Hazardous Surf Warning for Thursday for Byron, Coffs, Macquarie, Hunter and Sydney coasts',
      'icon': Icons.warning,
    },
    {
      'time': 'Wed 5:06PM AEST',
      'state': 'NSW/ACT',
      'description': 'Storm Force Wind Warning 2 For Southeastern Area',
      'icon': Icons.warning,
    },
    {
      'time': 'Wed 2:46PM AWST',
      'state': 'WA',
      'description': 'Ocean Wind Warning For Tropical Cyclone',
      'icon': Icons.cyclone,
    },
    {
      'time': 'Wed 2:39PM AWST',
      'state': 'WA',
      'description': 'Tropical Cyclone watch for Kuri Bay to Broome, not including Broome',
      'icon': Icons.cyclone,
    },
    {
      'time': 'Wed 4:39PM AEST',
      'state': 'NSW/ACT',
      'description': 'Gale Warning 4 For Western And Southern Areas',
      'icon': Icons.warning,
    },
    {
      'time': 'Wed 4:37PM AEST',
      'state': 'NSW/ACT',
      'description': 'Severe Weather Warning (Damaging Winds And Damaging Surf) for Lord Howe Island',
      'icon': Icons.warning,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CropWiseAppBar(currentPage: ''),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Back button and title
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                InkWell(
                  onTap: () {
                    Navigator.pop(context);
                  },
                  child: Row(
                    children: [
                      const Icon(Icons.arrow_back),
                      const SizedBox(width: 8),
                      const Text(
                        'Back to Weather',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                TextButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.download),
                  label: const Text('Download Report'),
                ),
              ],
            ),
          ),
          
          // Weather Warnings title
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              'Weather Warnings',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          
          // Location dropdown
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: DropdownButton<String>(
              value: _selectedLocation,
              icon: const Icon(Icons.arrow_drop_down),
              isExpanded: true,
              underline: Container(
                height: 2,
                color: const Color(0xFF6ABF69),
              ),
              onChanged: (String? newValue) {
                setState(() {
                  _selectedLocation = newValue!;
                  // Toggle warnings for demo purposes
                  _hasWarnings = !_hasWarnings;
                });
              },
              items: <String>['Bendigo, Victoria', 'Sydney, NSW', 'Perth, WA', 'Brisbane, QLD']
                  .map<DropdownMenuItem<String>>((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Row(
                    children: [
                      const Icon(Icons.location_on, size: 20),
                      const SizedBox(width: 8),
                      Text(value),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Table header
          Container(
            color: const Color(0xFF3A4A64),
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            child: const Row(
              children: [
                Expanded(
                  flex: 2,
                  child: Text(
                    'ISSUE TIME',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Expanded(
                  flex: 1,
                  child: Text(
                    'STATE',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Expanded(
                  flex: 4,
                  child: Text(
                    'WARNING DESCRIPTION',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Table content
          Expanded(
            child: _hasWarnings
                ? ListView.builder(
                    itemCount: _warningsList.length,
                    itemBuilder: (context, index) {
                      final warning = _warningsList[index];
                      return Container(
                        decoration: BoxDecoration(
                          border: Border(
                            bottom: BorderSide(color: Colors.grey.shade300),
                          ),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                          child: Row(
                            children: [
                              Expanded(
                                flex: 2,
                                child: Text(warning['time']),
                              ),
                              Expanded(
                                flex: 1,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF3A4A64),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    warning['state'],
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                flex: 4,
                                child: Row(
                                  children: [
                                    Icon(warning['icon']),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(warning['description']),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  )
                : Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.check_circle_outline,
                            size: 64,
                            color: Colors.green,
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'There are no active warnings for this location.',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}