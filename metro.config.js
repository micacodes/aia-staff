const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push("hcscript");
defaultConfig.transformer.assetPlugins = ["expo-asset/tools/hashAssetFiles"];

module.exports = defaultConfig
// (async () => { 
// 	const {  
// 		resolver: { 
// 			sourceExts, 
// 			assetExts 
// 		}  
// 	} = defaultConfig; 

// 	return {
// 		transformer: {      
// 			babelTransformerPath: require.resolve("react-native-svg-transformer")    
// 		},    
// 		resolver: {
// 			assetExts: assetExts.filter(ext => ext !== "svg"),
// 			sourceExts: [...sourceExts, "svg"]    
// 		}};
// })();
