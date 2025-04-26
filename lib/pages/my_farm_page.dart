import 'package:flutter/material.dart';
import '../components/cropwise_app_bar.dart';
import 'crop_suggestions_page.dart'; // Import for navigation

class MyFarmPage extends StatefulWidget {
  const MyFarmPage({Key? key}) : super(key: key);

  @override
  State<MyFarmPage> createState() => _MyFarmPageState();
}

class _MyFarmPageState extends State<MyFarmPage> {
  final TextEditingController _locationController = TextEditingController(text: "President's Park, Werribee");
  final TextEditingController _areaController = TextEditingController(text: "45");
  
  String _selectedSoilType = "Calcarosol";
  List<String> _cropHistory = ["Wheat", "Barley", "Canola"];
  String _yieldPerformance = "Medium";
  String _farmSizeUnit = "Hectares (ha)";
  bool _isEditing = false;
  
  @override
  void dispose() {
    _locationController.dispose();
    _areaController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth > 768;
    
    return Scaffold(
      appBar: const CropWiseAppBar(currentPage: 'My Farm'),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: isDesktop
                  ? _buildDesktopLayout()
                  : _buildMobileLayout(),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          setState(() {
            _isEditing = !_isEditing;
          });
        },
        backgroundColor: const Color(0xFF3AB54A),
        child: Icon(_isEditing ? Icons.save : Icons.edit),
      ),
    );
  }
  
  Widget _buildDesktopLayout() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Left side - Form
        Expanded(
          flex: 5,
          child: _buildFormContent(),
        ),
        const SizedBox(width: 24),
        // Right side - Map and Address
        Expanded(
          flex: 5,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildMapSection(),
              const SizedBox(height: 24),
              _buildAddressSection(),
              const SizedBox(height: 24),
              _buildGetSuggestionsButton(),
            ],
          ),
        ),
      ],
    );
  }
  
  Widget _buildMobileLayout() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildFormContent(),
        const SizedBox(height: 24),
        _buildMapSection(),
        const SizedBox(height: 16),
        _buildAddressSection(),
        const SizedBox(height: 24),
        _buildGetSuggestionsButton(),
      ],
    );
  }
  
  Widget _buildFormContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Set up your farm",
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 24),
        
        // Location Detection
        const Text(
          "Location Detection",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: _isEditing ? () {} : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFD9D9D9),
                  foregroundColor: Colors.black,
                  disabledBackgroundColor: const Color(0xFFE8E8E8),
                  disabledForegroundColor: Colors.grey,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text("Use my location"),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: ElevatedButton(
                onPressed: _isEditing ? () {} : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFD9D9D9),
                  foregroundColor: Colors.black,
                  disabledBackgroundColor: const Color(0xFFE8E8E8),
                  disabledForegroundColor: Colors.grey,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text("Enter Manually"),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        
        // Location Search
        TextField(
          controller: _locationController,
          enabled: _isEditing,
          decoration: InputDecoration(
            hintText: "Search location",
            suffixIcon: const Icon(Icons.search),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(30),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          ),
        ),
        const SizedBox(height: 24),
        
        // Soil Type
        const Text(
          "Soil Type",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            _buildSoilTypeButton("Calcarosol"),
            _buildSoilTypeButton("Chromosol"),
            _buildSoilTypeButton("Sodosol"),
            _buildSoilTypeButton("Kurosol"),
          ],
        ),
        const SizedBox(height: 24),
        
        // Crop History
        const Text(
          "Crop History",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey),
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.all(12),
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _cropHistory.map((crop) => _buildCropHistoryChip(crop)).toList(),
          ),
        ),
        const SizedBox(height: 24),
        
        // Yield Performance
        const Text(
          "Yield Performance",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            _buildYieldButton("Low"),
            const SizedBox(width: 12),
            _buildYieldButton("Medium"),
            const SizedBox(width: 12),
            _buildYieldButton("High"),
          ],
        ),
        const SizedBox(height: 24),
        
        // Farm Size
        const Text(
          "Farm Size",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFFD9D9D9),
                  borderRadius: BorderRadius.circular(30),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _farmSizeUnit,
                    isExpanded: true,
                    icon: const Icon(Icons.arrow_drop_down),
                    onChanged: _isEditing 
                      ? (String? newValue) {
                          if (newValue != null) {
                            setState(() {
                              _farmSizeUnit = newValue;
                            });
                          }
                        }
                      : null,
                    items: ["Hectares (ha)", "Acres"].map((String value) {
                      return DropdownMenuItem<String>(
                        value: value,
                        child: Text(value),
                      );
                    }).toList(),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: TextField(
                controller: _areaController,
                enabled: _isEditing,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  hintText: "Area",
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(4),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
  
  Widget _buildSoilTypeButton(String soilType) {
    final isSelected = _selectedSoilType == soilType;
    
    return ElevatedButton(
      onPressed: _isEditing 
        ? () {
            setState(() {
              _selectedSoilType = soilType;
            });
          }
        : null,
      style: ElevatedButton.styleFrom(
        backgroundColor: isSelected ? Colors.grey.shade400 : const Color(0xFFD9D9D9),
        foregroundColor: Colors.black,
        disabledBackgroundColor: isSelected ? Colors.grey.shade400 : const Color(0xFFE8E8E8),
        disabledForegroundColor: Colors.grey.shade700,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(30),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      ),
      child: Text(soilType),
    );
  }
  
  Widget _buildCropHistoryChip(String crop) {
    return Chip(
      label: Text(crop),
      deleteIcon: _isEditing ? const Icon(Icons.close, size: 16) : null,
      onDeleted: _isEditing 
        ? () {
            setState(() {
              _cropHistory.remove(crop);
            });
          }
        : null,
      backgroundColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(4),
        side: const BorderSide(color: Colors.grey),
      ),
    );
  }
  
  Widget _buildYieldButton(String yield) {
    final isSelected = _yieldPerformance == yield;
    
    return Expanded(
      child: OutlinedButton(
        onPressed: _isEditing 
          ? () {
              setState(() {
                _yieldPerformance = yield;
              });
            }
          : null,
        style: OutlinedButton.styleFrom(
          backgroundColor: isSelected ? Colors.grey.shade200 : Colors.transparent,
          side: BorderSide(
            color: isSelected ? Colors.black : Colors.grey,
            width: isSelected ? 2 : 1,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
          padding: const EdgeInsets.symmetric(vertical: 12),
          foregroundColor: Colors.black,
          disabledForegroundColor: Colors.grey.shade700,
        ),
        child: Text(
          yield,
          style: TextStyle(
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }
  
  Widget _buildMapSection() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Stack(
        children: [
          Image.asset(
            'assets/farm_map.png', // Make sure to add this asset
            width: double.infinity,
            height: 360,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) => Container(
              width: double.infinity,
              height: 360,
              color: Colors.green.shade200,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.map,
                      size: 50,
                      color: Colors.green,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      "Farm Map",
                      style: TextStyle(
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (_isEditing)
            Positioned(
              top: 16,
              right: 16,
              child: Container(
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
                child: IconButton(
                  icon: const Icon(Icons.edit_location_alt),
                  onPressed: () {
                    // Implement map editing functionality
                  },
                  tooltip: "Edit farm boundaries",
                ),
              ),
            ),
        ],
      ),
    );
  }
  
  Widget _buildAddressSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Address",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          "370 McGrath Road, Wyndham Vale,",
          style: TextStyle(fontSize: 16),
        ),
        const Text(
          "Victoria 3024",
          style: TextStyle(fontSize: 16),
        ),
      ],
    );
  }
  
  Widget _buildGetSuggestionsButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const CropSuggestionsPage()),
          );
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFD9D9D9),
          foregroundColor: Colors.black,
          padding: const EdgeInsets.symmetric(vertical: 20),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        child: const Text(
          "Get Personalized Crop Suggestions",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
