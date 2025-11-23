import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from scipy import stats


def load_survey_data(csv_path):
    df = pd.read_csv(csv_path)
    
    response_cols = list(range(1, 17))
    
    baseline_data = df.iloc[2:12, response_cols].values.astype(float)
    condition_data = df.iloc[14:24, response_cols].values.astype(float)
    
    questions = []
    for i in range(2, 12):
        question_text = df.iloc[i, 0].strip()
        direction = df.iloc[i, 21]
        
        if "(higher better" in str(direction):
            full_question = f"{question_text} (higher is better ↑)"
        elif "(lower better" in str(direction):
            full_question = f"{question_text} (lower is better ↓)"
        else:
            full_question = question_text
        
        questions.append(full_question)
    
    return baseline_data, condition_data, questions


def calculate_statistics(data):
    stats_list = []
    
    for q_idx in range(data.shape[0]):
        responses = data[q_idx, :]
        responses = responses[~np.isnan(responses)]
        
        mean_val = np.mean(responses)
        std_val = np.std(responses, ddof = 1)
        
        counts = {}
        for i in range(1, 8):
            counts[i] = int(np.sum(responses == i))
        
        stats_list.append({
            "mean": mean_val,
            "std": std_val,
            "counts": counts,
            "responses": responses
        })
    
    return stats_list


def perform_t_tests(baseline_stats, condition_stats, n_questions):
    p_values = []
    
    for i in range(n_questions):
        baseline_responses = baseline_stats[i]["responses"]
        condition_responses = condition_stats[i]["responses"]
        
        t_stat, p_val = stats.ttest_ind(baseline_responses, condition_responses)
        p_values.append(p_val)
    
    return p_values


def setup_figure(n_questions):
    fig, axes = plt.subplots(n_questions, 1, figsize = (15, n_questions * 1.4 + 0.8))
    fig.subplots_adjust(hspace = 0.5, right = 0.92, top = 0.96, left = 0.1)
    
    return fig, axes


def get_color_scheme():
    colors = {
        1: "#B8651B",
        2: "#E8965E",
        3: "#FFD699",
        4: "#FFFACD",
        5: "#B8E6B8",
        6: "#66BB6A",
        7: "#2E7D32"
    }
    
    return colors


def get_scale_labels():
    labels = [
        "Extremely disagree",
        "Moderately disagree",
        "Slightly disagree",
        "Neither disagree nor agree",
        "Slightly agree",
        "Moderately agree",
        "Extremely agree"
    ]
    
    return labels


def create_legend(colors, scale_labels):
    legend_elements = []
    for i in range(1, 8):
        patch = mpatches.Patch(color = colors[i], label = scale_labels[i - 1])
        legend_elements.append(patch)
    
    return legend_elements


def plot_stacked_bar(ax, counts, y_position, colors):
    left = 0
    
    for i in range(1, 8):
        width = counts[i - 1]
        ax.barh(y_position, width, left = left, color = colors[i], 
                edgecolor = "white", linewidth = 1.5)
        
        if width > 0:
            ax.text(left + width / 2, y_position, str(width),
                   ha = "center", va = "center", fontsize = 10, fontweight = "bold")
        
        left += width
    
    return left


def format_axis(ax, question_text):
    ax.set_yticks([0, 1])
    ax.set_yticklabels(["Proposed Method", "Baseline"], fontsize = 11, fontweight = "bold")
    ax.set_title(question_text, fontsize = 11, pad = 10, fontweight = "bold", loc = "left")
    ax.set_xlabel("")
    
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["bottom"].set_visible(False)
    ax.tick_params(bottom = False, labelbottom = False)


def add_statistics_text(ax, baseline_stat, condition_stat, text_x):
    ax.text(text_x, 0, f"{condition_stat['mean']:.3f} ({condition_stat['std']:.3f})",
           va = "center", fontsize = 10, fontweight = "bold")
    
    ax.text(text_x, 1, f"{baseline_stat['mean']:.3f} ({baseline_stat['std']:.3f})",
           va = "center", fontsize = 10, fontweight = "bold")


def add_mean_sd_label(ax, text_x):
    ax.text(text_x, 2.1, "MEAN (SD)", va = "center", fontsize = 9, fontweight = "bold")


def add_significance_bracket(ax, p_value, text_x):
    if p_value < 0.05:
        bracket_x = text_x + 2.8
        
        ax.plot([bracket_x, bracket_x], [0, 1], "k-", linewidth = 1.2)
        ax.plot([bracket_x, bracket_x - 0.15], [0, 0], "k-", linewidth = 1.2)
        ax.plot([bracket_x, bracket_x - 0.15], [1, 1], "k-", linewidth = 1.2)
        ax.text(bracket_x + 0.2, 0.5, "*", fontsize = 14, va = "center", 
               ha = "left", fontweight = "bold")
        
        return True
    
    return False


def set_axis_limits(ax, max_width, has_significance):
    if has_significance:
        ax.set_xlim(0, max_width + 4)
    else:
        ax.set_xlim(0, max_width + 3.5)


def plot_single_question(ax, baseline_counts, condition_counts, baseline_stat, 
                         condition_stat, p_value, question_text, colors, is_first):
    
    left_condition = plot_stacked_bar(ax, condition_counts, 0, colors)
    left_baseline = plot_stacked_bar(ax, baseline_counts, 1, colors)
    
    format_axis(ax, question_text)
    
    max_width = max(left_baseline, left_condition)
    text_x = max_width + 0.5
    
    add_statistics_text(ax, baseline_stat, condition_stat, text_x)
    
    if is_first:
        add_mean_sd_label(ax, text_x)
    
    has_significance = add_significance_bracket(ax, p_value, text_x)
    set_axis_limits(ax, max_width, has_significance)


def add_figure_legend(fig, legend_elements):
    fig.legend(handles = legend_elements, loc = "upper center", ncol = 7,
              bbox_to_anchor = (0.5, 0.995), frameon = True, fontsize = 9,
              fancybox = True, shadow = True, framealpha = 0.98,
              edgecolor = "black", facecolor = "white")


def create_visualization(baseline_stats, condition_stats, p_values, questions):
    n_questions = len(questions)
    
    fig, axes = setup_figure(n_questions)
    colors = get_color_scheme()
    scale_labels = get_scale_labels()
    legend_elements = create_legend(colors, scale_labels)
    
    for q_idx in range(n_questions):
        baseline_counts = [baseline_stats[q_idx]["counts"][i] for i in range(1, 8)]
        condition_counts = [condition_stats[q_idx]["counts"][i] for i in range(1, 8)]
        
        plot_single_question(
            axes[q_idx],
            baseline_counts,
            condition_counts,
            baseline_stats[q_idx],
            condition_stats[q_idx],
            p_values[q_idx],
            questions[q_idx],
            colors,
            q_idx == 0
        )
    
    add_figure_legend(fig, legend_elements)
    
    return fig


def save_visualization(fig, output_path):
    plt.tight_layout(rect = [0, 0, 1, 0.97])
    plt.savefig(output_path, dpi = 300, bbox_inches = "tight")
    plt.close()


def analyze_survey(csv_path, output_path):
    baseline_data, condition_data, questions = load_survey_data(csv_path)
    baseline_stats = calculate_statistics(baseline_data)
    condition_stats = calculate_statistics(condition_data)
    p_values = perform_t_tests(baseline_stats, condition_stats, len(questions))
    fig = create_visualization(baseline_stats, condition_stats, p_values, questions)
    save_visualization(fig, output_path)

if __name__ == "__main__":
    csv_path = "../surveyResults.csv"
    output_path = "../visualizations/surveyResultVisualization.png"
    
    analyze_survey(csv_path, output_path)