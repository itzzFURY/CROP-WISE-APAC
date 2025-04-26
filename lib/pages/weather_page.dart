import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'dart:async';
import '../components/cropwise_app_bar.dart';

class WeatherPage extends StatefulWidget {
  const WeatherPage({Key? key}) : super(key: key);

  @override
  State<WeatherPage> createState() => _WeatherPageState();
}

class _WeatherPageState extends State<WeatherPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isMapLoading = true;
  
  // TODO: Replace with your API key
  final String _openWeatherMapApiKey = '712e944f3af7fa9850a0c1a4bc1a00b9';
  
  // Location coordinates for Victoria, Australia (similar to your Windy link)
  final double _latitude = -37.874;
  final double _longitude = 144.834;
  
  // Map controller
  final MapController _mapController = MapController();
  
  // Weather layer options
  String _currentLayer = 'wind';
  final Map<String, String> _weatherLayers = {
    'wind': 'Wind',
    'temp': 'Temperature',
    'clouds': 'Clouds',
    'precipitation': 'Precipitation',
    'pressure': 'Pressure',
  };
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this, animationDuration: const Duration(milliseconds: 300));
    
    // Simulate map loading
    Timer(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() {
          _isMapLoading = false;
        });
      }
    });
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CropWiseAppBar(currentPage: 'Weather'),
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
                    Navigator.pushReplacementNamed(context, '/home');
                  },
                  child: Row(
                    children: [
                      const Icon(Icons.arrow_back),
                      const SizedBox(width: 8),
                      const Text(
                        'Back to Dashboard',
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
          
          // Weather Overview title
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              'Weather Overview',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          
          // Location
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                const Icon(Icons.location_on, color: Colors.black),
                const SizedBox(width: 8),
                const Text(
                  'Bendigo, Victoria',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Tab bar
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(30),
            ),
            child: TabBar(
              controller: _tabController,
              indicator: BoxDecoration(
                color: Colors.grey[700],
                borderRadius: BorderRadius.circular(30),
              ),
              labelColor: Colors.white,
              unselectedLabelColor: Colors.black,
              labelStyle: const TextStyle(fontWeight: FontWeight.bold),
              unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal),
              tabs: [
                Tab(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.check_circle, size: 16),
                      const SizedBox(width: 4),
                      const Text('7day forecast'),
                    ],
                  ),
                ),
                Tab(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.history, size: 16),
                      const SizedBox(width: 4),
                      const Text('Weather history'),
                    ],
                  ),
                ),
                Tab(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.warning_amber_rounded, size: 16),
                      const SizedBox(width: 4),
                      const Text('Weather warnings'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Tab content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              physics: const ClampingScrollPhysics(),
              children: [
                _buildForecastTab(),
                _buildHistoryTab(),
                _buildWarningsTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildForecastTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '7 Day Forecast',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          
          // Weather forecast cards
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildDayForecast('Mon', 'Sunny', '18°', Icons.wb_sunny),
                _buildDayForecast('Tue', 'Rainy', '13°', Icons.grain),
                _buildDayForecast('Wed', 'Foggy', '20°', Icons.cloud),
                _buildDayForecast('Thr', 'Windy', '23°', Icons.air),
                _buildDayForecast('Fri', 'Cloudy', '15°', Icons.cloud_queue),
                _buildDayForecast('Sat', 'Storm', '18°', Icons.thunderstorm),
                _buildDayForecast('Sun', 'Day rain', '18°', Icons.water_drop),
              ],
            ),
          ),
          
          const SizedBox(height: 40),
          
          // Weather map
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Weather Map',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              // Weather layer dropdown
              if (_openWeatherMapApiKey != 'YOUR_OPENWEATHERMAP_API_KEY')
                DropdownButton<String>(
                  value: _currentLayer,
                  onChanged: (String? newValue) {
                    if (newValue != null) {
                      setState(() {
                        _currentLayer = newValue;
                      });
                    }
                  },
                  items: _weatherLayers.entries
                      .map<DropdownMenuItem<String>>((entry) {
                    return DropdownMenuItem<String>(
                      value: entry.key,
                      child: Text(entry.value),
                    );
                  }).toList(),
                ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Weather Map using flutter_map
          Container(
            height: 300,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(12),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Stack(
                children: [
                  // Flutter Map
                  FlutterMap(
                    mapController: _mapController,
                    options: MapOptions(
                      center: LatLng(_latitude, _longitude),
                      zoom: 5,
                      interactiveFlags: InteractiveFlag.all,
                    ),
                    children: [
                      // Base map layer
                      TileLayer(
                        urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        userAgentPackageName: 'com.cropwise.app',
                      ),
                      
                      // Weather tile layer (if you have an OpenWeatherMap API key)
                      if (_openWeatherMapApiKey != 'YOUR_OPENWEATHERMAP_API_KEY')
                        TileLayer(
                          urlTemplate: 'https://tile.openweathermap.org/map/$_currentLayer/{z}/{x}/{y}.png?appid=$_openWeatherMapApiKey',
                          userAgentPackageName: 'com.cropwise.app',
                        ),
                      
                      // Marker for Bendigo
                      MarkerLayer(
                        markers: [
                          Marker(
                            point: LatLng(_latitude, _longitude),
                            width: 80,
                            height: 80,
                            builder: (context) => const Icon(
                              Icons.location_on,
                              color: Colors.red,
                              size: 40,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  
                  // Loading indicator
                  if (_isMapLoading)
                    Container(
                      color: Colors.grey[200],
                      child: const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6ABF69)),
                            ),
                            SizedBox(height: 16),
                            Text('Loading Weather Map...'),
                          ],
                        ),
                      ),
                    ),
                    
                  // Map controls
                  Positioned(
                    right: 10,
                    bottom: 10,
                    child: Column(
                      children: [
                        FloatingActionButton.small(
                          heroTag: 'zoomIn',
                          onPressed: () {
                            final zoom = _mapController.zoom + 1;
                            _mapController.move(_mapController.center, zoom);
                          },
                          backgroundColor: Colors.white,
                          child: const Icon(Icons.add, color: Colors.black),
                        ),
                        const SizedBox(height: 8),
                        FloatingActionButton.small(
                          heroTag: 'zoomOut',
                          onPressed: () {
                            final zoom = _mapController.zoom - 1;
                            _mapController.move(_mapController.center, zoom);
                          },
                          backgroundColor: Colors.white,
                          child: const Icon(Icons.remove, color: Colors.black),
                        ),
                      ],
                    ),
                  ),
                  
                  // API key missing message
                  if (_openWeatherMapApiKey == 'YOUR_OPENWEATHERMAP_API_KEY')
                    Container(
                      color: Colors.grey[200],
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.cloud_off,
                              size: 64,
                              color: Colors.grey,
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'Weather Map',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 32),
                              child: Text(
                                'Add your OpenWeatherMap API key to display weather data',
                                textAlign: TextAlign.center,
                              ),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () {
                                // Open browser to OpenWeatherMap signup
                                // You would need to implement a URL launcher here
                              },
                              child: const Text('Get API Key'),
                            ),
                          ],
                        ),
                      ),
                    ),
                    
                  // Weather legend
                  if (_openWeatherMapApiKey != 'YOUR_OPENWEATHERMAP_API_KEY')
                    Positioned(
                      left: 10,
                      bottom: 10,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _weatherLayers[_currentLayer] ?? 'Weather',
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            _buildLegendForLayer(_currentLayer),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          
          // Alternative: Embed Windy.com in an iframe (for web only)
          const SizedBox(height: 16),
          const Text(
            'Note: For a more detailed weather map like Windy.com, consider using the desktop browser version.',
            style: TextStyle(
              fontSize: 12,
              fontStyle: FontStyle.italic,
              color: Colors.grey,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildLegendForLayer(String layer) {
    switch (layer) {
      case 'wind':
        return Row(
          children: [
            Container(width: 20, height: 10, color: Colors.blue.shade100),
            Container(width: 20, height: 10, color: Colors.blue.shade300),
            Container(width: 20, height: 10, color: Colors.blue.shade500),
            Container(width: 20, height: 10, color: Colors.green.shade300),
            Container(width: 20, height: 10, color: Colors.yellow),
            Container(width: 20, height: 10, color: Colors.orange),
            Container(width: 20, height: 10, color: Colors.red),
          ],
        );
      case 'temp':
        return Row(
          children: [
            Container(width: 20, height: 10, color: Colors.blue.shade900),
            Container(width: 20, height: 10, color: Colors.blue.shade500),
            Container(width: 20, height: 10, color: Colors.blue.shade300),
            Container(width: 20, height: 10, color: Colors.green.shade300),
            Container(width: 20, height: 10, color: Colors.yellow),
            Container(width: 20, height: 10, color: Colors.orange),
            Container(width: 20, height: 10, color: Colors.red),
          ],
        );
      case 'clouds':
        return Row(
          children: [
            Container(width: 20, height: 10, color: Colors.transparent),
            Container(width: 20, height: 10, color: Colors.grey.shade100),
            Container(width: 20, height: 10, color: Colors.grey.shade300),
            Container(width: 20, height: 10, color: Colors.grey.shade500),
            Container(width: 20, height: 10, color: Colors.grey.shade700),
          ],
        );
      case 'precipitation':
        return Row(
          children: [
            Container(width: 20, height: 10, color: Colors.transparent),
            Container(width: 20, height: 10, color: Colors.blue.shade100),
            Container(width: 20, height: 10, color: Colors.blue.shade300),
            Container(width: 20, height: 10, color: Colors.blue.shade500),
            Container(width: 20, height: 10, color: Colors.blue.shade700),
            Container(width: 20, height: 10, color: Colors.purple),
          ],
        );
      case 'pressure':
        return Row(
          children: [
            Container(width: 20, height: 10, color: Colors.blue.shade900),
            Container(width: 20, height: 10, color: Colors.blue.shade500),
            Container(width: 20, height: 10, color: Colors.green.shade300),
            Container(width: 20, height: 10, color: Colors.yellow),
            Container(width: 20, height: 10, color: Colors.orange),
            Container(width: 20, height: 10, color: Colors.red),
          ],
        );
      default:
        return const SizedBox.shrink();
    }
  }
  
  Widget _buildHistoryTab() {
    // History tab content remains the same
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Monthly Weather History',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          
          // Month selector
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'December 2024',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.arrow_drop_down),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Monthly statistics
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Column(
              children: [
                _buildStatRow('Average Temperature', '22°C'),
                const Divider(),
                _buildStatRow('Highest Temperature', '36°C (Dec 15)'),
                const Divider(),
                _buildStatRow('Lowest Temperature', '12°C (Dec 3)'),
                const Divider(),
                _buildStatRow('Total Rainfall', '45mm'),
                const Divider(),
                _buildStatRow('Rainy Days', '8 days'),
                const Divider(),
                _buildStatRow('Average Humidity', '65%'),
              ],
            ),
          ),
          
          const SizedBox(height: 32),
          
          // Temperature chart
          const Text(
            'Temperature Trend',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            height: 200,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: const Center(
              child: Text('Temperature Chart Placeholder'),
            ),
          ),
          
          const SizedBox(height: 32),
          
          // Rainfall chart
          const Text(
            'Rainfall Distribution',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            height: 200,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: const Center(
              child: Text('Rainfall Chart Placeholder'),
            ),
          ),
          
          const SizedBox(height: 16),
        ],
      ),
    );
  }
  
  Widget _buildWarningsTab() {
    return Center(
      child: ElevatedButton.icon(
        onPressed: () {
          Navigator.pushNamed(context, '/weather_warnings');
        },
        icon: const Icon(Icons.warning_amber_rounded),
        label: const Text('View Weather Warnings'),
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
      ),
    );
  }
  
  Widget _buildDayForecast(String day, String condition, String temp, IconData icon) {
    return Container(
      width: 130,
      margin: const EdgeInsets.only(right: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            day,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Icon(
            icon,
            size: 40,
          ),
          const SizedBox(height: 16),
          Text(
            condition,
            style: const TextStyle(
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            temp,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildStatRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 16,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}