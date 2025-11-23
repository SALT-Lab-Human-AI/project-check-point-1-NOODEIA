import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt


def load_csv_data(csv_path):
    df = pd.read_csv(csv_path, header = None)
    return df


def wrap_text(text, max_length = 60):
    words = text.split()
    lines = []
    current_line = []
    current_length = 0
    
    for word in words:
        word_length = len(word)
        if current_length + word_length + len(current_line) <= max_length:
            current_line.append(word)
            current_length += word_length
        else:
            if current_line:
                lines.append(" ".join(current_line))
            current_line = [word]
            current_length = word_length
    
    if current_line:
        lines.append(" ".join(current_line))
    
    return "\n".join(lines)


def extract_question_data(df, baseline_rows, proposed_rows):
    questions = []
    baseline_data = []
    proposed_data = []
    
    for i, (b_idx, p_idx) in enumerate(zip(baseline_rows, proposed_rows)):
        question_text = df.iloc[b_idx, 0]
        question_text = str(question_text).replace("\n", " ").strip()
        
        if question_text.startswith("Q"):
            question_text = question_text.split(".", 1)[1].strip() if "." in question_text else question_text
        
        q_num = f"Q{i + 1}"
        direction_col = df.iloc[b_idx, 21]
        
        if "higher better" in str(direction_col):
            direction = "(higher better ↑)"
        elif "lower better" in str(direction_col):
            direction = "(lower better ↓)"
        else:
            direction = "(higher better ↑)"
        
        question_label = f"{q_num}. {question_text} {direction}"
        question_label = wrap_text(question_label, max_length = 60)
        questions.append(question_label)
        
        baseline_responses = df.iloc[b_idx, 1:17].values
        proposed_responses = df.iloc[p_idx, 1:17].values
        
        baseline_responses = pd.to_numeric(baseline_responses, errors = "coerce")
        proposed_responses = pd.to_numeric(proposed_responses, errors = "coerce")
        
        baseline_responses = baseline_responses[~np.isnan(baseline_responses)]
        proposed_responses = proposed_responses[~np.isnan(proposed_responses)]
        
        baseline_data.append(baseline_responses)
        proposed_data.append(proposed_responses)
    
    return questions, baseline_data, proposed_data


def calculate_statistics(baseline_data, proposed_data):
    results = []
    
    for b_data, p_data in zip(baseline_data, proposed_data):
        baseline_mean = np.mean(b_data)
        baseline_std = np.std(b_data, ddof = 1)
        proposed_mean = np.mean(p_data)
        proposed_std = np.std(p_data, ddof = 1)
        
        percentage_change = ((proposed_mean - baseline_mean) / baseline_mean) * 100
        
        results.append({
            "baseline_mean": baseline_mean,
            "baseline_std": baseline_std,
            "proposed_mean": proposed_mean,
            "proposed_std": proposed_std,
            "percentage_change": percentage_change
        })
    
    return results


def prepare_table_data(questions, results):
    table_data = []
    
    for i, (question, result) in enumerate(zip(questions, results)):
        baseline_cell = f"{result['baseline_mean']:.2f} ({result['baseline_std']:.3f})"
        proposed_cell = f"{result['proposed_mean']:.2f} ({result['proposed_std']:.3f})"
        
        percentage_change = result["percentage_change"]
        if percentage_change >= 0:
            percentage_cell = f"+{percentage_change:.2f}%"
        else:
            percentage_cell = f"{percentage_change:.2f}%"
        
        table_data.append([
            question,
            baseline_cell,
            proposed_cell,
            percentage_cell
        ])
    
    return table_data


def setup_figure():
    fig, ax = plt.subplots(figsize = (14, 8))
    ax.axis("tight")
    ax.axis("off")
    return fig, ax


def create_table(ax, table_data):
    headers = ["Question", "Baseline Avg. (SD)", "Proposed Avg. (SD)", "Percentage Change"]
    
    table = ax.table(cellText = table_data, colLabels = headers, 
                    cellLoc = "left", loc = "center",
                    colWidths = [0.40, 0.20, 0.20, 0.20])
    
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1, 2)
    
    return table, headers


def style_header_row(table, headers):
    for i in range(len(headers)):
        cell = table[(0, i)]
        cell.set_facecolor("#E0E0E0")
        cell.set_text_props(weight = "bold", ha = "center")
        cell.set_edgecolor("black")
        cell.set_linewidth(1.5)


def style_data_rows(table, table_data, headers):
    for i in range(len(table_data)):
        for j in range(len(headers)):
            cell = table[(i + 1, j)]
            cell.set_edgecolor("black")
            cell.set_linewidth(1)
            
            if j in [1, 2, 3]:
                cell.set_text_props(ha = "center")
            
            if j == 3:
                cell.set_text_props(weight = "bold")


def save_figure(output_path):
    plt.tight_layout()
    plt.savefig(output_path, dpi = 300, bbox_inches = "tight", facecolor = "white")
    plt.close()


def generate_table(csv_path, output_path):
    df = load_csv_data(csv_path)
    
    baseline_rows = list(range(3, 13))
    proposed_rows = list(range(15, 25))
    
    questions, baseline_data, proposed_data = extract_question_data(df, baseline_rows, proposed_rows)
    results = calculate_statistics(baseline_data, proposed_data)
    table_data = prepare_table_data(questions, results)
    
    fig, ax = setup_figure()
    table, headers = create_table(ax, table_data)
    
    style_header_row(table, headers)
    style_data_rows(table, table_data, headers)
    
    save_figure(output_path)


if __name__ == "__main__":
    csv_path = "../surveyResults.csv"
    output_path = "../visualizations/surveyResultsPercentageIncrease.png"
    
    generate_table(csv_path, output_path)