/**
 * Born of the Gods, group E: Fated Return's indestructible and its-your-turn
 * scry, Thassa's Rebuff's devotion-sized tax, Scourge of Skola Vale's
 * sacrificed toughness, Everflame Eidolon's Aura-or-creature pump, the
 * inspired creatures' untap triggers, Black Oak of Odunos's tap cost, Elite
 * Skirmisher's heroic tap and Eater of Hope's two-creature sacrifice.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  enter,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Fated Return", () => {
  it("puts an opponent's creature card onto the battlefield under your control, indestructible, and scries 2 on your turn", () => {
    const { game, a } = table();
    lands(game, "Swamp", 7);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    cast(game, toHand(game, "Fated Return"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(scried).toBe(2);
  });
});

describe("Thassa's Rebuff", () => {
  it("counters unless the controller pays X, X your devotion to blue as it resolves", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    spawn(game, "Flitterstep Eidolon");
    spawn(game, "Flitterstep Eidolon");
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    pickModes(a, 0);
    // Devotion 2, and only one mana left to pay with: countered.
    cast(game, toHand(game, "Thassa's Rebuff"), { targets: [ref(bolt)] });
    expect(life(game, B)).toBe(20);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("with no devotion, X is 0 and the spell resolves", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    pickModes(a, 0);
    cast(game, toHand(game, "Thassa's Rebuff"), { targets: [ref(bolt)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Scourge of Skola Vale", () => {
  it("enters with two counters and grows by the sacrificed creature's toughness", () => {
    const { game } = table();
    const scourge = enter(game, "Scourge of Skola Vale");
    expect(counters(game, scourge)).toBe(2);
    const oak = spawn(game, "Black Oak of Odunos");
    game.dispatch({ type: "activate-ability", player: A, source: scourge, abilityIndex: 0, targets: [], sacrifice: oak });
    settle(game);
    expect(zone(game, oak)).toBe("graveyard");
    expect(counters(game, scourge)).toBe(7);
  });
});

describe("Everflame Eidolon", () => {
  it("as a creature, pumps itself", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const eidolon = spawn(game, "Everflame Eidolon");
    activate(game, eidolon);
    expect(pt(game, eidolon)).toEqual({ power: 2, toughness: 1 });
  });

  it("bestowed, pumps the enchanted creature instead", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    const eidolon = toHand(game, "Everflame Eidolon");
    cast(game, eidolon, { overload: true, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    activate(game, eidolon);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("inspired", () => {
  it("God-Favored General: paying {2}{W} as it untaps makes two Soldiers", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const general = spawn(game, "God-Favored General", A, { tapped: true });
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(general)]);
    settle(game);
    expect(tokensNamed(game, "1/1 White Enchantment Soldier Token", A)).toBe(2);
  });

  it("Servant of Tymaret: each opponent loses 1 and you gain that much", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Servant of Tymaret", A, { tapped: true });
    toStep(game, "precombat-main");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(22);
  });

  it("Oreskos Sun Guide: doesn't trigger on entering untapped", () => {
    const { game } = table();
    enter(game, "Oreskos Sun Guide");
    expect(life(game, A)).toBe(20);
  });
});

describe("Black Oak of Odunos", () => {
  it("taps another creature, even a summoning-sick one, to get +1/+1", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const oak = spawn(game, "Black Oak of Odunos");
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    activate(game, oak);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[oak].tapped).toBe(false);
    expect(pt(game, oak)).toEqual({ power: 1, toughness: 6 });
  });
});

describe("Elite Skirmisher", () => {
  it("heroic: may tap target creature", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const skirmisher = spawn(game, "Elite Skirmisher");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(skirmisher)] });
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Eater of Hope", () => {
  it("sacrifices two other creatures to destroy target creature", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const eater = spawn(game, "Eater of Hope");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const victim = spawn(game, "Hill Giant", B);
    activate(game, eater, 1, { targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("graveyard");
    expect(zone(game, eater)).toBe("battlefield");
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
  });
});
