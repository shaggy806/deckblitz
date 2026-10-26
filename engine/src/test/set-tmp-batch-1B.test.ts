/**
 * Tempest (TMP, B178), group B. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Tempest group B", () => {
  it("Eladamri gives other Elf creatures forestwalk and every other Elf permanent shroud", () => {
    const { game } = table();
    const eladamri = spawn(game, "Eladamri, Lord of Leaves");
    const theirElf = spawn(game, "Llanowar Elves", B);
    const tribal = spawn(game, "Prowess of the Fair", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(keywords(game, theirElf).has("forestwalk")).toBe(true);
    expect(keywords(game, theirElf).has("shroud")).toBe(true);
    expect(keywords(game, tribal).has("shroud")).toBe(true);
    expect(keywords(game, eladamri).has("shroud")).toBe(false);
    expect(keywords(game, eladamri).has("forestwalk")).toBe(false);
    expect(keywords(game, bears).has("shroud")).toBe(false);
  });

  it("Insight draws when an opponent casts a green spell", () => {
    const { game } = table();
    spawn(game, "Insight");
    nextTurn(game);
    lands(game, "Forest", 1, B);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Llanowar Elves", B), { player: B });
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Reckless Spite destroys two nonblack creatures and costs 5 life", () => {
    const { game } = table();
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Llanowar Elves", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Reckless Spite"), { targets: [ref(x), ref(y)] });
    expect(zone(game, x)).toBe("graveyard");
    expect(zone(game, y)).toBe("graveyard");
    expect(life(game, A)).toBe(15);
  });

  it("Ancient Runes deals each upkeep player damage equal to their artifacts", () => {
    const { game } = table();
    spawn(game, "Ancient Runes");
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", B);
    nextTurn(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });

  it("Orim's Prayer gains 1 life for each creature attacking you", () => {
    const { game, b } = table();
    spawn(game, "Orim's Prayer");
    nextTurn(game);
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Llanowar Elves", B);
    attack(game, b, [x, y], A);
    // +2 from the Prayer, then 3 combat damage.
    expect(life(game, A)).toBe(20 + 2 - 3);
  });

  it("Starke of Rath destroys the target and its controller gains control of Starke", () => {
    const { game } = table();
    const starke = spawn(game, "Starke of Rath");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, starke, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(controller(game, starke)).toBe(B);
  });

  it("Blood Frenzy pumps an attacker and destroys it at the next end step", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Blood Frenzy"), { targets: [ref(bears)] });
    expect(pt(game, bears).power).toBe(6);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(14);
    expect(zone(game, bears)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Endless Scream enters with X scream counters, +1/+0 each", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    pickTargets(a, bears);
    const aura = toHand(game, "Endless Scream");
    cast(game, aura, { targets: [ref(bears)], x: 3 });
    expect(counters(game, aura, "scream")).toBe(3);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
  });

  it("Shocker makes the damaged player discard their hand and draw that many", () => {
    const { game, a } = table();
    const shocker = spawn(game, "Shocker");
    const before = hand(game, B).length;
    const gyBefore = graveyard(game, B).length;
    attack(game, a, [shocker]);
    expect(graveyard(game, B).length).toBe(gyBefore + before);
    expect(hand(game, B).length).toBe(before);
  });
});
