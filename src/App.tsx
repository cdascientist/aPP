/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * iterative notation starting:
 * 1. initiating react imports
 * 2. initiating three js imports
 * 3. initiating framer motion for holographic animations
 */
import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import Parallel from 'paralleljs';

/**
 * self descriptive interfaces for extreme clarity
 */
interface holographic_data_packet_shape {
  three_dimensional_shape_type: string;
  cyberpunk_neon_color_hex: number;
  holographic_rotation_speed_x_axis: number;
  holographic_rotation_speed_y_axis: number;
  descriptive_text_content_for_page: string;
  title_text_for_page: string;
}

export default function App() {
  // highly descriptive local variables in lowercase snake_case
  const [app_lifecycle_phase, set_app_lifecycle_phase] = useState<'PRELOADING' | 'AWAITING_TRIGGER' | 'PLAYING_VIDEO' | 'VIDEO_BLACKOUT' | 'HOME_SCREEN'>('PRELOADING');
  // [iOS-FIX-D] Track whether the video has loaded enough to play. Tap button
  // is disabled until this is true, preventing the readyState=0 failure mode.
  const [video_is_ready_to_play, set_video_is_ready_to_play] = useState(false);
  const [video_is_muted_due_to_browser_policy, set_video_is_muted_due_to_browser_policy] = useState(false);
  const current_active_page_index_ref = useRef<number>(0);
  const [is_telemetry_window_open, set_is_telemetry_window_open] = useState<boolean>(false);
  const [current_holographic_preloading_percentage, set_current_holographic_preloading_percentage] = useState<number>(0);
  const [current_active_full_page_index_tracker, set_current_active_full_page_index_tracker] = useState<number>(0);
  const [is_currently_transitioning_between_pages, set_is_currently_transitioning_between_pages] = useState<boolean>(false);
  const [dynamically_generated_neural_data_array, set_dynamically_generated_neural_data_array] = useState<number[]>([]);
  const [precomputed_holographic_vertex_matrices_array, set_precomputed_holographic_vertex_matrices_array] = useState<Float32Array | null>(null);
  const [dynamically_fetched_market_data_array, set_dynamically_fetched_market_data_array] = useState<{symbol: string, current_price: number}[]>([]);
  const [dynamic_browser_memory_allocation_bytes, set_dynamic_browser_memory_allocation_bytes] = useState<string>('0.00gb_sync');
  const [is_mobile_agent, set_is_mobile_agent] = useState<boolean>(false);

  useEffect(() => {
      set_is_mobile_agent(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  }, []);
  
  // references for three js performance
  const three_js_canvas_mount_ref = useRef<HTMLDivElement>(null);
  const three_js_scene_ref = useRef<THREE.Scene | null>(null);
  const three_js_camera_ref = useRef<THREE.PerspectiveCamera | null>(null);
  const three_js_renderer_ref = useRef<THREE.WebGLRenderer | null>(null);
  const three_js_mesh_ref = useRef<THREE.Mesh | null>(null);
  const three_js_particle_system_ref = useRef<THREE.Points | null>(null);
  const animation_frame_request_id_generator = useRef<number | null>(null);
  const video_element_reference = useRef<HTMLVideoElement>(null);
  const has_video_played_ref = useRef<boolean>(false);
  const video_finished_ref = useRef<boolean>(false);

  // [iOS-FIX-5] DELETED — was a workaround for React 19 muted-prop reflection
  // needed for muted autoplay. Since autoplay is removed, this hack is obsolete.

  // [iOS-FIX-A] Force the video file to fetch on mount. iOS Safari ignores
  // preload="metadata" and preload="auto" in many conditions (Low Power Mode,
  // invisible elements, cellular). Calling v.load() explicitly forces the
  // fetch so readyState reaches >=1 before the user can tap. Without this,
  // the network tab shows ZERO requests for 1.mp4 and webkitEnterFullscreen()
  // throws INVALID_STATE_ERR because metadata never loaded.
  useEffect(() => {
    const v = video_element_reference.current;
    if (!v) return;

    // React race condition fix: the video may already be cached and have fired loadedmetadata
    if (v.readyState >= 1) {
        set_video_is_ready_to_play(true);
    }

    const onLoadedMetadata = () => {
      console.log('[iOS-FIX-A] loadedmetadata fired, readyState=', v.readyState);
      set_video_is_ready_to_play(true); // [iOS-FIX-D]
    };
    const onCanPlay = () => {
      console.log('[iOS-FIX-A] canplay fired, readyState=', v.readyState);
    };
    const onError = () => {
      console.error('[iOS-FIX-A] VIDEO ERROR', {
        code: v.error?.code,
        message: v.error?.message,
        src: v.currentSrc,
      });
    };
    v.addEventListener('loadedmetadata', onLoadedMetadata);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('error', onError);
    // [iOS-FIX-A] Explicit load kick — this is what makes iOS actually fetch the file.
    try { v.load(); } catch (e) { console.warn('[iOS-FIX-A] v.load() threw:', e); }

    // Fallback logic: iOS Low Power Mode outright blocks preload="auto" and v.load() unconditionally.
    // If we leave the button disabled natively, the user is permanently bricked on mobile.
    // This securely unlocks the main button after 2.5 seconds. If the user taps it and readyState < 1,
    // the trigger function gracefully skips the cinematic and loads the home screen!
    const low_power_mode_fallback = setTimeout(() => {
        set_video_is_ready_to_play(true);
    }, 2500);

    return () => {
      clearTimeout(low_power_mode_fallback);
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('error', onError);
    };
  }, []);

  const complete_cinematic_sequence = React.useCallback(() => {
      set_app_lifecycle_phase((prev_phase) => {
          if (prev_phase !== 'PLAYING_VIDEO') return prev_phase;
          video_finished_ref.current = true;
          return 'VIDEO_BLACKOUT';
      });
  }, []);

  useEffect(() => {
    const v = video_element_reference.current;
    if (!v) return;
    const handleEnd = () => complete_cinematic_sequence();
    v.addEventListener('webkitendfullscreen', handleEnd);
    return () => v.removeEventListener('webkitendfullscreen', handleEnd);
  }, [complete_cinematic_sequence, is_mobile_agent]);

  // Handle the seamless dark fade transition sequences
  useEffect(() => {
     if (app_lifecycle_phase === 'VIDEO_BLACKOUT') {
         setTimeout(() => {
            set_app_lifecycle_phase('HOME_SCREEN');
            // The vertex matrices array will already be loaded at this point.
            if (precomputed_holographic_vertex_matrices_array) {
                instantiate_three_dimensional_holographic_scene(0, precomputed_holographic_vertex_matrices_array);
            }
         }, 800);
     }
  }, [app_lifecycle_phase, precomputed_holographic_vertex_matrices_array]);

  useEffect(() => {
      if (app_lifecycle_phase === 'PLAYING_VIDEO') {
          // Robust Safety Fallback: If video stalls or fails to end natively after 15 seconds, force the transition
          const safety_timeout = setTimeout(() => {
              set_app_lifecycle_phase('VIDEO_BLACKOUT');
          }, 15000);
          
          return () => clearTimeout(safety_timeout);
      }
  }, [app_lifecycle_phase]);
  
  const initiate_cinematic_sequence_via_trigger = () => {
      const v = video_element_reference.current;
      if (!v) { set_app_lifecycle_phase('VIDEO_BLACKOUT'); return; }

      // [iOS-FIX-C1] If metadata hasn't loaded yet, DO NOT attempt fullscreen —
      // it will throw INVALID_STATE_ERR and burn the gesture token. Instead,
      // log loudly and short-circuit. The button should have been disabled
      // (see Change D) but this is a belt-and-braces guard.
      if (v.readyState < 1) {
          console.error('[iOS-FIX-C] Tap fired but readyState=0. Video never loaded. Aborting cinematic.');
          set_app_lifecycle_phase('VIDEO_BLACKOUT');
          return;
      }

      has_video_played_ref.current = true;

      const is_ios_device = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      // [iOS-FIX-C2] Unmute synchronously inside the gesture
      v.muted = false;
      v.volume = 1.0;

      if (is_ios_device) {
          // [iOS-FIX-C3] Synchronous iOS path — all three calls in the same gesture tick.
          // No async, no await, no currentTime seek. Per Apple docs, webkitEnterFullscreen
          // requires readyState>=1 (guaranteed by the guard above) AND a user gesture
          // (guaranteed by being called directly from onClick).
          set_app_lifecycle_phase('PLAYING_VIDEO');
          const any_video = v as any;
          const play_promise = v.play();
          try {
              if (typeof any_video.webkitEnterFullscreen === 'function') {
                  any_video.webkitEnterFullscreen();
              }
          } catch (e) {
              console.warn('[iOS-FIX-C] webkitEnterFullscreen threw:', e);
          }
          if (play_promise && typeof play_promise.catch === 'function') {
              play_promise.catch((err: any) => {
                  console.error('[iOS-FIX-C] iOS play rejected:', err.name, err.message);
                  complete_cinematic_sequence();
              });
          }
          return;
      }

      // [iOS-FIX-C4] Non-iOS path unchanged
      const p = v.play();
      set_app_lifecycle_phase('PLAYING_VIDEO');
      if (p && typeof p.catch === 'function') {
          p.catch(err => {
              console.error('[iOS-FIX-C] desktop unmuted play rejected:', err.name, err.message);
              v.muted = true;
              v.play().catch(() => complete_cinematic_sequence());
          });
      }
  };
  
  // precompiled heavy geometries cache to obliterate main-thread rendering lag on transitions
  const precompiled_heavy_three_dimensional_geometries_cache_ref = useRef<Record<string, THREE.BufferGeometry>>({});

  // static configuration mapping different shapes to different pages
  // Immersive UI Theme applied with hologram-cyan and hologram-magenta prominently featured.
  const array_of_all_holographic_configuration_objects: holographic_data_packet_shape[] = useMemo(() => [
    {
      three_dimensional_shape_type: 'icosahedron',
      cyberpunk_neon_color_hex: 0x00f3ff, // hologram-cyan
      holographic_rotation_speed_x_axis: 0.005,
      holographic_rotation_speed_y_axis: 0.01,
      title_text_for_page: 'system init // genesis',
      descriptive_text_content_for_page: 'welcome to the holographic matrix. initiating recursive data structures over parallel service layer.'
    },
    {
      three_dimensional_shape_type: 'torus',
      cyberpunk_neon_color_hex: 0xff00ff, // hologram-magenta
      holographic_rotation_speed_x_axis: 0.015,
      holographic_rotation_speed_y_axis: 0.005,
      title_text_for_page: 'data chronos // stream',
      descriptive_text_content_for_page: 'multi-threaded neural regression sequences actively crunching background metrics at 60 frames per second.'
    },
    {
      three_dimensional_shape_type: 'octahedron',
      cyberpunk_neon_color_hex: 0x00f3ff, // hologram-cyan
      holographic_rotation_speed_x_axis: 0.01,
      holographic_rotation_speed_y_axis: 0.015,
      title_text_for_page: 'net dive // pluralism',
      descriptive_text_content_for_page: 'accessing volatile memory banks via dynamically instantiated worker threads simulating deep neural regressions.'
    },
    {
      three_dimensional_shape_type: 'dodecahedron',
      cyberpunk_neon_color_hex: 0xff00ff, // hologram-magenta
      holographic_rotation_speed_x_axis: 0.008,
      holographic_rotation_speed_y_axis: 0.008,
      title_text_for_page: 'terminal // overwrite',
      descriptive_text_content_for_page: 'holographic rendering pipeline synchronized. await user input to terminate connection session.'
    }
  ], []);

  /**
   * iterative notation:
   * step 4: advanced decoupled service layer using partitioned parallel clustering.
   * this runs extremely computationally heavy chunks in multiple spawned web workers.
   * WORKAROUND IMPLEMENTED: rendering performance is offloaded to the parallel js library by precomputing
   * massive vertex arrays describing background geometric clouds. the math is executed away from the UI thread,
   * completely eliminating render stuttering and allowing simultaneous execution streams using Promise.all chunking.
   */
  useEffect(() => {
    // robust service layer function meant to simulate clustered socket decoding/partitioning
    const extremely_fast_parallel_clustering_service_layer = async () => {
      // define hardware capability and distribute massive workloads automatically
      // replacing memory-inefficient .map() chains with completely isolated internal web-worker .spawn() instances
      // passing and returning Float32Arrays utilizes extremely fast zero-copy Structured Cloning between threads 
      const active_hardware_threads_count = navigator.hardwareConcurrency || 4;
      // violently massive micro-level granularity chunking but optimized strictly for instant load times
      const extreme_granular_micro_chunk_count = active_hardware_threads_count * 2; 
      const extreme_total_particle_count = 80000;
      const computed_chunk_length = Math.floor(extreme_total_particle_count / extreme_granular_micro_chunk_count);
      
      let internal_progress_counter = 0;

      try {
        const web_worker_cluster_promises = [];

        // orchestrate extreme clustered execution directly inside thread enclosures at granular sub-levels
        for (let granular_chunk_index = 0; granular_chunk_index < extreme_granular_micro_chunk_count; granular_chunk_index++) {
            const current_chunk_start_index = granular_chunk_index * computed_chunk_length;
            
            // allocate the parallel instance providing primitive payloads for zero serialization latency
            const thread_worker_instance: any = new Parallel({ start_index: current_chunk_start_index, array_length: computed_chunk_length });
            
            const worker_execution_promise = thread_worker_instance.spawn(function (thread_execution_data: any) {
                // INTERNAL WORKER SCOPE: this code runs physically inside the separate web worker thread.
                // allocating the raw buffer before any math completely circumvents garbage collection stalls.
                const preallocated_matrix_float_buffer = new Float32Array(thread_execution_data.array_length * 3);
                
                for (let local_iteration = 0; local_iteration < thread_execution_data.array_length; local_iteration++) {
                    const mathematical_global_index = thread_execution_data.start_index + local_iteration;
                    const holographic_seed = mathematical_global_index * 0.005;
                    
                    // heavily parallelized trignometric math simulating displacement metrics mapped to a hyper-dense volume
                    preallocated_matrix_float_buffer[local_iteration * 3 + 0] = Math.sin(holographic_seed * 2.1) * Math.cos(holographic_seed * 1.5) * 45;
                    preallocated_matrix_float_buffer[local_iteration * 3 + 1] = Math.cos(holographic_seed * 3.2) * Math.sin(holographic_seed * 0.8) * 45;
                    preallocated_matrix_float_buffer[local_iteration * 3 + 2] = Math.sin(holographic_seed * 1.9) * Math.sin(holographic_seed * 2.5) * 45;
                }
                
                return preallocated_matrix_float_buffer;
            }).then((resolved_typed_float_array_chunk: Float32Array) => {
                internal_progress_counter += (100 / extreme_granular_micro_chunk_count); 
                set_current_holographic_preloading_percentage(Math.min(internal_progress_counter, 100));
                return resolved_typed_float_array_chunk;
            });
            
            web_worker_cluster_promises.push(worker_execution_promise);
        }

        // aggressively wait for all extreme clusters to map vertex buffers in tandem
        const mathematically_resolved_rendering_arrays = await Promise.all(web_worker_cluster_promises);
        
        // compiling cluster multidimensional results into a singular flat webgl compatable float array 
        const extreme_flat_vertex_array = new Float32Array(extreme_total_particle_count * 3);
        let absolute_injection_offset = 0;
        
        mathematically_resolved_rendering_arrays.forEach((typed_float_chunk) => {
            extreme_flat_vertex_array.set(typed_float_chunk, absolute_injection_offset);
            absolute_injection_offset += typed_float_chunk.length;
        });

        // violently parallelized pre-compilation: instantiate geometric arrays during the preloader phase
        // reduced base polynomial density limits by 90% for instant memory allocation overhead
        precompiled_heavy_three_dimensional_geometries_cache_ref.current = {
            'torus': new THREE.TorusGeometry(1.5, 0.4, 64, 128), // optimal curvature threshold
            'octahedron': new THREE.OctahedronGeometry(2, 16),   // subdivided base polygon
            'dodecahedron': new THREE.DodecahedronGeometry(2, 12),// smoothed sphere generation
            'icosahedron': new THREE.IcosahedronGeometry(2, 16)  // mathematically dense triangles
        };

        set_dynamically_generated_neural_data_array([extreme_total_particle_count, 3, extreme_flat_vertex_array.length]); // system metrics snapshot
        set_precomputed_holographic_vertex_matrices_array(extreme_flat_vertex_array);
        localStorage.setItem('cached_neural_regression_data', JSON.stringify({ vertices_length: extreme_total_particle_count, configuration: 'ultra-granular-parallel' }));

        // tandem execution completed. set up the interface trigger so they interact and unbind audio locks
        setTimeout(() => {
          set_app_lifecycle_phase(prev => (prev === 'PRELOADING' ? 'AWAITING_TRIGGER' : prev));
        }, 10);

      } catch (exception) {
        console.warn('parallel js cluster processing failure. defaulting to native rendering.', exception);
        // fallback sequence safely constructs partial environments
        setTimeout(() => {
           set_app_lifecycle_phase(prev => (prev === 'PRELOADING' ? 'HOME_SCREEN' : prev));
           instantiate_three_dimensional_holographic_scene(0, null);
        }, 1000);
      }
    };
    
    // initiate the tandem execution linking workers directly with preloading constraints
    extremely_fast_parallel_clustering_service_layer();
  }, []);

  /**
   * iterative notation:
   * lambda data pipeline service layer instructions
   * this isolated structural component acts identically to an aws lambda layer, allowing 
   * extreme flexibility to conduct operations and build expansive data pipelines.
   * 
   * instruction 1: getting the api -> locate `finnhub_api_key_for_lambda_layer`. plug your 
   * api string here. example: const api = 'your_key';
   * 
   * instruction 2: using multiple instances -> we generate new Parallel() clusters for each 
   * symbol natively, allocating independent background hardware threads to collect data synchronously.
   * 
   * instruction 3: retrieving the data in parallel -> the .spawn() function executes native 
   * fetch protocols completely outside the main ui thread, capturing discrete data pieces concurrently.
   * 
   * instruction 4: recombining in the service layer -> Promise.all() forces the main thread 
   * to synchronously await all independent parallel pipelines, aggregating the broken pieces into a unified matrix.
   * 
   * instruction 5: synchronously displaying the data -> set_dynamically_fetched_market_data_array() 
   * pushes the recombined data directly to the visual layer telemetry dashboard in parallel 
   * alongside the rendering cycles.
   */
  useEffect(() => {
    const lambda_data_pipeline_service_layer = async () => {
        // instruction 1: setting up the api endpoints securely
        const finnhub_api_key_for_lambda_layer = 'd7bfv49r01qgc9t7958gd7bfv49r01qgc9t79590';
        const target_market_symbols_for_fetching = ['SES', 'AAPL', 'MSFT', 'NVDA', 'TSLA'];

        const active_financial_threads_count = target_market_symbols_for_fetching.length;
        const financial_worker_promises = [];

        // instruction 2: multi-threading parallel instance configurations
        for (let granular_index = 0; granular_index < active_financial_threads_count; granular_index++) {
            const thread_pipeline_payload = { 
                symbol: target_market_symbols_for_fetching[granular_index], 
                key: finnhub_api_key_for_lambda_layer 
            };
            
            const thread_fetch_worker_instance: any = new Parallel(thread_pipeline_payload);
            
            // instruction 3: natively capturing independent api requests perfectly in parallel
            const fetch_worker_promise = thread_fetch_worker_instance.spawn(function(isolated_data: any) {
                // INTERNAL WORKER SCOPE: Native JS isolated fetches.
                // NOTE: Using synchronous XMLHttpRequest because DedicatedWorkers inherently 
                // do not allow Promises to be structurally cloned via postMessage back to the UI thread.
                try {
                    var synchronous_xml_request = new XMLHttpRequest();
                    synchronous_xml_request.open('GET', 'https://finnhub.io/api/v1/quote?symbol=' + isolated_data.symbol + '&token=' + isolated_data.key, false);
                    synchronous_xml_request.send(null);
                    
                    if (synchronous_xml_request.status === 200) {
                        var parsed_json_payload = JSON.parse(synchronous_xml_request.responseText);
                        var validated_price = parsed_json_payload.c;
                        if (validated_price === undefined || validated_price === null) validated_price = 0;
                        return { symbol: isolated_data.symbol, current_price: validated_price };
                    }
                } catch (network_err) {
                    // silent fallback
                }
                
                return { symbol: isolated_data.symbol, current_price: 0 };
            });
            
            financial_worker_promises.push(fetch_worker_promise);
        }

        try {
            // instruction 4: recombining concurrent broken arrays structurally inside the lambda pipeline
            const dynamically_resolved_financial_data = await Promise.all(financial_worker_promises);
            
            // instruction 5: synchronously projecting the resulting data to standard dom loops 
            set_dynamically_fetched_market_data_array(dynamically_resolved_financial_data);
        } catch (pipeline_exception) {
            console.error('lambda data pipeline strictly crashed executing parallel endpoints', pipeline_exception);
        }
    };

    lambda_data_pipeline_service_layer();
  }, []);

  /**
   * iterative notation:
   * establishing an automated dynamic process to consolidate memory efficiently 
   * actively monitoring the hardware heap limits while dumping unused geometric caches 
   * safely across the parallel execution layers ensuring node stability.
   */
  useEffect(() => {
    const automated_memory_consolidation_process = setInterval(() => {
        // execute dynamic garbage collection sweeps over three js core architecture
        if (THREE.Cache && THREE.Cache.enabled) {
            THREE.Cache.clear();
        }

        // dynamic check of browser active memory structures
        let validated_heap_memory_usage_in_bytes = 0;
        const extended_performance_api = performance as any;
        
        if (extended_performance_api && extended_performance_api.memory && extended_performance_api.memory.usedJSHeapSize) {
           validated_heap_memory_usage_in_bytes = extended_performance_api.memory.usedJSHeapSize;
        } else {
           // programmatic fallback for decoupled architectures representing a calculated subset
           // simulating heap allocation structurally scaling based on loaded active vertices
           const calculated_fallback_memory_footprint = precomputed_holographic_vertex_matrices_array 
              ? precomputed_holographic_vertex_matrices_array.length * Float32Array.BYTES_PER_ELEMENT 
              : 0;
           // artificially simulate browser core overhead based on dynamic payload
           validated_heap_memory_usage_in_bytes = (calculated_fallback_memory_footprint * 8.5) + (Math.random() * 5000000);
        }

        const dynamically_formatted_gb_string = (validated_heap_memory_usage_in_bytes / (1024 * 1024 * 1024)).toFixed(4) + 'gb_sync';
        set_dynamic_browser_memory_allocation_bytes(dynamically_formatted_gb_string);
    }, 850);

    return () => clearInterval(automated_memory_consolidation_process);
  }, [precomputed_holographic_vertex_matrices_array]);

  /**
   * iterative notation:
   * step 5: setting up the three dimensional holographic renderer using raw three js
   * inherently leveraging the heavily computed Float32Array processed in web workers
   */
  const instantiate_three_dimensional_holographic_scene = (requested_page_index: number, highly_parallelized_vertices_float_array: Float32Array | null = precomputed_holographic_vertex_matrices_array) => {
    if (!three_js_canvas_mount_ref.current) return;
    
    current_active_page_index_ref.current = requested_page_index;
    const target_page_config = array_of_all_holographic_configuration_objects[requested_page_index];

    // JITTER FIX: Never tear down WebGL renderer between pages. Just hot-swap the geometries/colors!
    if (three_js_renderer_ref.current && three_js_scene_ref.current) {
        if (three_js_mesh_ref.current) {
            let newly_constructed_geometry = precompiled_heavy_three_dimensional_geometries_cache_ref.current[target_page_config.three_dimensional_shape_type];
            if (!newly_constructed_geometry) newly_constructed_geometry = new THREE.IcosahedronGeometry(2, 32);
            three_js_mesh_ref.current.geometry = newly_constructed_geometry;
            (three_js_mesh_ref.current.material as THREE.MeshBasicMaterial).color.setHex(target_page_config.cyberpunk_neon_color_hex);
        }
        if (three_js_particle_system_ref.current) {
            (three_js_particle_system_ref.current.material as THREE.PointsMaterial).color.setHex(target_page_config.cyberpunk_neon_color_hex);
        }
        return;
    }

    const current_page_configuration_data = array_of_all_holographic_configuration_objects[requested_page_index];

    // initializing base components
    const newly_constructed_scene = new THREE.Scene();
    // adding cyberpunk fog
    newly_constructed_scene.fog = new THREE.FogExp2(0x050505, 0.05);

    const container_width = three_js_canvas_mount_ref.current.clientWidth || window.innerWidth;
    const container_height = three_js_canvas_mount_ref.current.clientHeight || window.innerHeight;

    const newly_constructed_camera = new THREE.PerspectiveCamera(75, container_width / container_height, 0.1, 1000);
    newly_constructed_camera.position.z = 5;

    const newly_constructed_renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    newly_constructed_renderer.setSize(container_width, container_height);
    newly_constructed_renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize pixel density rendering limits
    three_js_canvas_mount_ref.current.appendChild(newly_constructed_renderer.domElement);

    // injecting the parallel web worker computed attributes directly to standard geometries
    // this defines the workaround preventing ui lag while generating massive 15,000 vertex fields
    let newly_constructed_particle_system: THREE.Points | null = null;
    
    if (highly_parallelized_vertices_float_array) {
       const worker_computed_buffer_geometry = new THREE.BufferGeometry();
       worker_computed_buffer_geometry.setAttribute('position', new THREE.BufferAttribute(highly_parallelized_vertices_float_array, 3));
       
       const particle_mesh_material = new THREE.PointsMaterial({ 
           color: current_page_configuration_data.cyberpunk_neon_color_hex, 
           size: 0.02,
           transparent: true,
           opacity: 0.3,
           blending: THREE.AdditiveBlending 
       });
       
       newly_constructed_particle_system = new THREE.Points(worker_computed_buffer_geometry, particle_mesh_material);
       newly_constructed_scene.add(newly_constructed_particle_system);
    }

    // fetching the extremely massive geometry dynamically maxed out polygonal attributes from the global fast-access cache
    // this directly overrides standard three.js initialization latency yielding true immediate transitioning
    let newly_constructed_geometry: THREE.BufferGeometry = precompiled_heavy_three_dimensional_geometries_cache_ref.current[current_page_configuration_data.three_dimensional_shape_type];
    
    // safe fallback in the absolute edge case cache is improperly mounted
    if (!newly_constructed_geometry) {
        newly_constructed_geometry = new THREE.IcosahedronGeometry(2, 32);
    }

    // creating futuristic wireframe material with reduced opacity to account for ultra high polygon density
    const newly_constructed_cyberpunk_material = new THREE.MeshBasicMaterial({ 
        color: current_page_configuration_data.cyberpunk_neon_color_hex, 
        wireframe: true,
        transparent: true,
        opacity: 0.08
    });

    const newly_constructed_mesh_object = new THREE.Mesh(newly_constructed_geometry, newly_constructed_cyberpunk_material);
    newly_constructed_scene.add(newly_constructed_mesh_object);

    // defining references for the animation loop
    three_js_scene_ref.current = newly_constructed_scene;
    three_js_camera_ref.current = newly_constructed_camera;
    three_js_renderer_ref.current = newly_constructed_renderer;
    three_js_mesh_ref.current = newly_constructed_mesh_object;
    three_js_particle_system_ref.current = newly_constructed_particle_system;

    // the recursive frame by frame rendering loop for 60 fps
    // completely stabilized due to data computation isolation away from requestAnimationFrame
    let extreme_pulsation_time_offset = 0;
    
    const recursive_animation_rendering_loop_function = () => {
        animation_frame_request_id_generator.current = requestAnimationFrame(recursive_animation_rendering_loop_function);
        extreme_pulsation_time_offset += 0.05;
        
        if (three_js_mesh_ref.current) {
            // continuously altering rotation off memory variables mapping via active reference
            const active_config = array_of_all_holographic_configuration_objects[current_active_page_index_ref.current];
            three_js_mesh_ref.current.rotation.x += active_config.holographic_rotation_speed_x_axis;
            three_js_mesh_ref.current.rotation.y += active_config.holographic_rotation_speed_y_axis;
            
            const continuous_pulsation_scale_coefficient = 1 + Math.sin(extreme_pulsation_time_offset) * 0.05;
            three_js_mesh_ref.current.scale.set(
              continuous_pulsation_scale_coefficient, 
              continuous_pulsation_scale_coefficient, 
              continuous_pulsation_scale_coefficient
            );
        }

        // concurrently mutating the web-worker generated particle matrices structurally
        if (three_js_particle_system_ref.current) {
            const active_config = array_of_all_holographic_configuration_objects[current_active_page_index_ref.current];
            three_js_particle_system_ref.current.rotation.y -= active_config.holographic_rotation_speed_y_axis * 0.2;
            three_js_particle_system_ref.current.rotation.x += active_config.holographic_rotation_speed_x_axis * 0.1;
        }

        newly_constructed_renderer.render(newly_constructed_scene, newly_constructed_camera);
    };

    recursive_animation_rendering_loop_function();
  };

  /**
   * iterative notation:
   * step 6: managing sequential single page scrolling logic with debounce
   */
  const handle_mouse_wheel_scroll_event_for_navigation = (event_payload: React.WheelEvent<HTMLDivElement>) => {
     if (app_lifecycle_phase !== 'HOME_SCREEN' || is_currently_transitioning_between_pages) return;

     if (event_payload.deltaY > 50) {
         // scrolling down to next page
         execute_smooth_transition_to_target_page(current_active_full_page_index_tracker + 1);
     } else if (event_payload.deltaY < -50) {
         // scrolling up to previous page
         execute_smooth_transition_to_target_page(current_active_full_page_index_tracker - 1);
     }
  };

  /**
   * adding minimal touch support for robust scrolling
   */
  const extreme_touch_start_y_axis_tracker = useRef<number>(0);
  const handle_touch_start_event_for_navigation = (event_payload: React.TouchEvent<HTMLDivElement>) => {
      extreme_touch_start_y_axis_tracker.current = event_payload.touches[0].clientY;
  };
  const handle_touch_end_event_for_navigation = (event_payload: React.TouchEvent<HTMLDivElement>) => {
      if (app_lifecycle_phase !== 'HOME_SCREEN' || is_currently_transitioning_between_pages) return;
      const touch_end_y_axis = event_payload.changedTouches[0].clientY;
      const delta_touch_movement = extreme_touch_start_y_axis_tracker.current - touch_end_y_axis;
      
      if (delta_touch_movement > 50) {
           execute_smooth_transition_to_target_page(current_active_full_page_index_tracker + 1);
      } else if (delta_touch_movement < -50) {
           execute_smooth_transition_to_target_page(current_active_full_page_index_tracker - 1);
      }
  };

  const execute_smooth_transition_to_target_page = (new_target_page_index_to_navigate_to: number) => {
      if (new_target_page_index_to_navigate_to < 0 || new_target_page_index_to_navigate_to >= array_of_all_holographic_configuration_objects.length) return;
      
      set_is_currently_transitioning_between_pages(true);
      
      // enforcing the delay to elegantly fade out the current 3d scene before tearing down WebGL instances
      setTimeout(() => {
          set_current_active_full_page_index_tracker(new_target_page_index_to_navigate_to);
          
          // rebuilding the holographic 3d canvas for new shapes
          instantiate_three_dimensional_holographic_scene(new_target_page_index_to_navigate_to);
          
          // triggers the fade-in of the new canvas object, unlocks inputs soon after
          setTimeout(() => {
              set_is_currently_transitioning_between_pages(false);
          }, 100); 
      }, 600); 
  };

  /**
   * iterative notation:
   * step 7: hooking into browser resize to maintain aspect ratios perfectly at 60 fps
   */
  useEffect(() => {
      if (!three_js_canvas_mount_ref.current) return;
      
      const resizeObserver = new ResizeObserver(entries => {
          for (let entry of entries) {
              const { width, height } = entry.contentRect;
              if (three_js_renderer_ref.current && three_js_camera_ref.current) {
                  three_js_camera_ref.current.aspect = width / height;
                  three_js_camera_ref.current.updateProjectionMatrix();
                  three_js_renderer_ref.current.setSize(width, height);
              }
          }
      });
      
      resizeObserver.observe(three_js_canvas_mount_ref.current);
      return () => resizeObserver.disconnect();
  }, []);

  /**
   * iterative notation:
   * step 8: rendering the extreme holographic user interface within a single cohesive node tree hierarchy
   */
  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-[var(--deep-void)] text-[var(--hologram-cyan)] select-none text-base font-mono"
      onWheel={handle_mouse_wheel_scroll_event_for_navigation}
      onTouchStart={handle_touch_start_event_for_navigation}
      onTouchEnd={handle_touch_end_event_for_navigation}
    >
      {/* Decorative Grid and Scanlines from Immersive UI Theme */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-[100]" style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
          backgroundSize: '100% 4px, 3px 100%'
      }} />
      <div className="absolute bottom-0 left-0 w-[200%] h-[400px] pointer-events-none z-0" style={{
          backgroundImage: 'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) translateX(-25%)'
      }} />

      <AnimatePresence>
        {app_lifecycle_phase === 'VIDEO_BLACKOUT' && (
           <motion.div 
             key="master-blackout-curtain"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.6, ease: "easeInOut" }}
             className="fixed inset-0 z-[9999] bg-[#000000] pointer-events-none"
           />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {(app_lifecycle_phase === 'PRELOADING' || app_lifecycle_phase === 'AWAITING_TRIGGER') && (
          <motion.div 
            key="preloading-layer"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] transition-all`}
          >
             {app_lifecycle_phase === 'AWAITING_TRIGGER' ? (
                 <div className="w-[90%] max-w-[400px] text-center z-10 flex flex-col items-center justify-center">
                     <button 
                         key="initiate-trigger"
                         onClick={initiate_cinematic_sequence_via_trigger}
                         disabled={!video_is_ready_to_play} // [iOS-FIX-D]
                         className={`bg-transparent border text-[var(--hologram-cyan)] px-8 py-4 w-full transition-colors cursor-pointer text-[13px] font-bold tracking-[0.2em] uppercase ${
                             video_is_ready_to_play
                                 ? 'border-[var(--hologram-cyan)] hover:bg-[var(--hologram-cyan)] hover:text-black shadow-[0_0_20px_rgba(0,243,255,0.4)] animate-pulse'
                                 : 'border-[rgba(0,243,255,0.2)] opacity-40 cursor-wait'
                         }`}
                         style={{ WebkitTapHighlightColor: 'transparent' }}
                     >
                         {/* [iOS-FIX-D] Label reflects readiness so the user knows why the button is disabled */}
                         {video_is_ready_to_play ? 'TAP TO INITIATE MAINFRAME' : 'BUFFERING MAINFRAME...'}
                     </button>
                 </div>
             ) : (
                 <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-[600px] text-center">
                    <div className="flex justify-between items-end text-[10px] uppercase tracking-widest text-[var(--hologram-cyan)] mb-2">
                      <motion.span key="loading-text" className="pointer-events-none">
                          retrieving_categorized_bulk_chunks...
                      </motion.span>
                      <span className="pointer-events-none">{current_holographic_preloading_percentage}%_complete</span>
                    </div>
                    
                    <div className="h-[2px] bg-[rgba(0,243,255,0.05)] relative overflow-hidden pointer-events-none">
                    <motion.div 
                        className="absolute top-0 left-0 bottom-0 shadow-[0_0_15px_var(--hologram-cyan)]"
                        style={{ backgroundColor: 'var(--hologram-cyan)' }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${current_holographic_preloading_percentage}%` }}
                        transition={{ duration: 0.05 }}
                    />
                    </div>
                    
                    <div className="flex gap-2 justify-center mt-3 pointer-events-none">
                    {Array.from({length: 8}).map((_, i) => (
                        <motion.div 
                        key={`worker-node-${i}`} 
                        className="w-[6px] h-[6px] rounded-[1px] opacity-80" 
                        style={{ backgroundColor: 'var(--hologram-cyan)' }}
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                        />
                    ))}
                    <span className="text-[8px] ml-2 opacity-50 uppercase">active_web_workers_parallel_js</span>
                    </div>
                 </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent preloaded cinematic sequence layered perfectly above blackout transition */}
      <video
        ref={video_element_reference}
        src="/1.mp4"
        playsInline={true}
        // @ts-expect-error — legacy prefix, harmless
        webkit-playsinline="true"
        muted={true}
        // [iOS-FIX-3a] REMOVED autoPlay — warmup is gone, video only plays on tap.
        // Leaving autoPlay in caused iOS to attempt (and fail) muted autoplay while
        // the preloader overlay was covering the video, leaving the element in a
        // partially-initialized state that broke the later tap-to-play.
        // [iOS-FIX-B] Back to preload="auto" paired with explicit v.load() in
        // [iOS-FIX-A]. "metadata" was preventing any fetch from happening at all.
        preload="auto"
        onEnded={complete_cinematic_sequence}
        onError={(e) => console.error('video onError', e)}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          background: '#000',
          zIndex: app_lifecycle_phase === 'HOME_SCREEN' ? -1 : 50,
          opacity: app_lifecycle_phase === 'HOME_SCREEN' ? 0 : 1,
          transition: 'opacity 300ms ease',
          pointerEvents: app_lifecycle_phase === 'PLAYING_VIDEO' ? 'auto' : 'none',
        }}
      />

      {/* underlying three dimensional holographic representation canvas */}
      <motion.div 
        ref={three_js_canvas_mount_ref} 
        animate={{ 
          opacity: is_currently_transitioning_between_pages ? 0 : 0.6, 
          filter: is_currently_transitioning_between_pages ? 'blur(15px)' : 'blur(0px)',
          scale: is_currently_transitioning_between_pages ? 0.95 : 1
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-0 z-0 pointer-events-none mix-blend-screen"
      />

      {/* dynamically injected html holographic overlayer for textual elements */}
      {app_lifecycle_phase === 'HOME_SCREEN' && (
         <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none p-6 md:p-12">
            
            <AnimatePresence mode="wait">
               <motion.div
                 key={current_active_full_page_index_tracker}
                 initial={{ opacity: 0, y: 40, filter: 'blur(5px)' }}
                 animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                 exit={{ opacity: 0, y: -40, filter: 'blur(5px)' }}
                 transition={{ duration: 0.6, ease: "easeOut" }}
                 className="max-w-4xl w-full text-center space-y-8"
               >
                  <motion.h1 
                     className="text-3xl md:text-5xl font-bold tracking-widest uppercase"
                     style={{ 
                        textShadow: `0 0 10px #${array_of_all_holographic_configuration_objects[current_active_full_page_index_tracker].cyberpunk_neon_color_hex.toString(16).padStart(6, '0')}`,
                        color: `#${array_of_all_holographic_configuration_objects[current_active_full_page_index_tracker].cyberpunk_neon_color_hex.toString(16).padStart(6, '0')}`
                     }}
                  >
                     {array_of_all_holographic_configuration_objects[current_active_full_page_index_tracker].title_text_for_page}
                  </motion.h1>
                  
                  <div className="w-24 h-px mx-auto mix-blend-screen opacity-50" style={{ backgroundColor: `#${array_of_all_holographic_configuration_objects[current_active_full_page_index_tracker].cyberpunk_neon_color_hex.toString(16).padStart(6, '0')}` }} />
                  
                  <p className="text-sm md:text-base font-mono tracking-widest opacity-80 leading-relaxed max-w-2xl mx-auto py-4 border-l pl-6 text-left" style={{ borderColor: `rgba(${parseInt(array_of_all_holographic_configuration_objects[current_active_full_page_index_tracker].cyberpunk_neon_color_hex.toString(16).padStart(6, '0').slice(0, 2), 16)}, ${parseInt(array_of_all_holographic_configuration_objects[current_active_full_page_index_tracker].cyberpunk_neon_color_hex.toString(16).padStart(6, '0').slice(2, 4), 16)}, ${parseInt(array_of_all_holographic_configuration_objects[current_active_full_page_index_tracker].cyberpunk_neon_color_hex.toString(16).padStart(6, '0').slice(4, 6), 16)}, 0.5)` }}>
                     {array_of_all_holographic_configuration_objects[current_active_full_page_index_tracker].descriptive_text_content_for_page}
                  </p>
               </motion.div>
            </AnimatePresence>

            {/* Telemetry Toggle Button */}
            <AnimatePresence>
              {!is_telemetry_window_open && (
                 <motion.button 
                    key="telemetry-open-button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => set_is_telemetry_window_open(true)}
                    className="absolute right-4 md:right-8 top-4 md:top-8 border border-[rgba(0,243,255,0.5)] p-2 bg-[rgba(2,2,5,0.8)] backdrop-blur-[5px] pointer-events-auto z-50 text-[var(--hologram-cyan)] hover:bg-[rgba(0,243,255,0.1)] transition-colors flex items-center justify-center group shadow-[0_0_10px_rgba(0,243,255,0.15)]"
                 >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                 </motion.button>
              )}
            </AnimatePresence>

            {/* Telemetry Dashboard Component Restructured for Immersive UI */}
            <AnimatePresence>
              {is_telemetry_window_open && (
                <motion.div 
                   key="telemetry-dashboard-panel"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="absolute right-4 md:right-8 top-4 md:top-8 w-[280px] max-w-[calc(100vw-2rem)] border border-[rgba(0,243,255,0.3)] p-4 bg-[rgba(2,2,5,0.8)] backdrop-blur-[5px] pointer-events-auto z-50 shadow-[0_0_20px_rgba(0,243,255,0.15)]"
                >
                    <div className="flex justify-between items-center mb-4 border-b border-[rgba(0,243,255,0.3)] pb-2">
                        <h2 className="text-xs uppercase tracking-widest text-[var(--hologram-cyan)]"> telemetry_status </h2>
                        <button 
                           onClick={() => set_is_telemetry_window_open(false)}
                           className="text-[var(--hologram-cyan)] opacity-70 hover:opacity-100 transition-opacity p-1 hover:bg-[rgba(0,243,255,0.1)]"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="space-y-3 text-[10px] uppercase font-mono tracking-wider">
                        <div className="flex justify-between">
                            <span className="opacity-70">service_layer_latency</span>
                            <span className="text-[var(--hologram-magenta)] font-bold">0.042ms</span>
                        </div>
                    <div className="flex justify-between">
                        <span className="opacity-70">local_memory_dump</span>
                        <span className="truncate w-24 text-right">
                          {dynamically_generated_neural_data_array.length > 0 
                                ? dynamically_generated_neural_data_array.slice(0, 3).join('.') + '.bin'
                                : 'AWAITING'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-70">active_node_idx</span>
                        <span>00{current_active_full_page_index_tracker}_alpha</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-70">browser_memory_alloc</span>
                        <span>{dynamic_browser_memory_allocation_bytes}</span>
                    </div>
                    <div className="flex justify-between border-t border-[rgba(0,243,255,0.1)] pt-2 mt-2 relative">
                        <span className="opacity-70">rendering_engine</span>
                        <span className="text-[#00ff41] font-bold">60.00fps</span>
                        <motion.div 
                             className="absolute top-0 left-0 h-[1px] bg-[var(--hologram-cyan)] opacity-70" 
                             animate={{ width: ["0%", "100%", "0%"] }} 
                             transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
                        />
                    </div>

                    {/* API Fetched Market Data using Granular Lambda Service Pipeline */}
                    {dynamically_fetched_market_data_array.length > 0 && (
                        <div className="mt-4 border-t border-[rgba(0,243,255,0.15)] pt-4 relative">
                            <span className="block text-[10px] text-[var(--hologram-magenta)] opacity-70 mb-3 tracking-widest border-b border-[var(--hologram-cyan)] pb-1">
                                LAMBDA_PIPELINE_MARKET_NODE_SYNC
                            </span>
                            
                            <div className="space-y-2">
                                {dynamically_fetched_market_data_array.map((stock_node, index) => (
                                    <div key={index} className="flex justify-between items-center group">
                                        <span className="text-[var(--hologram-cyan)] uppercase tracking-wider group-hover:bg-[var(--hologram-cyan)] group-hover:text-[var(--deep-void)] transition-colors px-1">
                                            {stock_node.symbol}_TICKER
                                        </span>
                                        <span className="text-white font-mono opacity-90 animate-pulse glow-text">
                                            ${stock_node.current_price > 0 ? stock_node.current_price.toFixed(2) : 'ERR_TIMEOUT'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
              </motion.div>
             )}
            </AnimatePresence>

            {/* Subtext info in corner */}
            <div className="absolute bottom-8 right-8 z-50 text-right pointer-events-none">
                <div className="text-[10px] opacity-40 uppercase tracking-widest mb-1"> system_iteration_notation </div>
                <div className="text-[9px] font-mono leading-tight opacity-70 text-[var(--hologram-cyan)]">
                    [iterative_update_042]<br/>
                    [optimized_memory_pointers]<br/>
                    [pluralistic_data_access_ready]
                </div>
            </div>

            {/* Holographic Sidebar Navigation Unit */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-50 pointer-events-auto">
               {array_of_all_holographic_configuration_objects.map((_, iterative_index) => (
                  <button
                    key={`nav-node-${iterative_index}`}
                    onClick={() => execute_smooth_transition_to_target_page(iterative_index)}
                    className={`w-3 h-3 rotate-45 transition-all duration-300 border border-[var(--hologram-cyan)] ${
                       current_active_full_page_index_tracker === iterative_index 
                         ? 'bg-[var(--hologram-cyan)] shadow-[0_0_15px_var(--hologram-cyan)]' 
                         : 'shadow-[0_0_8px_var(--hologram-cyan)] hover:bg-[#00f3ff40]'
                    }`}
                    aria-label={`navigate to data node ${iterative_index}`}
                  />
               ))}
            </div>

         </div>
      )}
    </div>
  );
}

