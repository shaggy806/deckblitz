/**
 * Magic 2015 and Conspiracy (M15, CNS; B158), group E. One test per card whose behaviour is
 * more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  keywords,
  lands,
  life,
  loyalty,
  named,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  types,
  subtypes,
  zone,
} from "./harness.js";

describe("Nissa, Worldwaker", () => {
  it("−7: only the basics it put onto the battlefield become 4/4 trampling Elementals, for good", () => {
    const { game, a } = table();
    const old = spawn(game, "Forest");
    const nissa = spawn(game, "Nissa, Worldwaker");
    const library = game.state.zones.perPlayer[A].library;
    const picked = [library[0], library[1]];
    pickFromZone(a, ...picked);
    loyalty(game, nissa, -7, { atLeast: 7 });
    for (const id of picked) {
      expect(zone(game, id)).toBe("battlefield");
      expect(types(game, id)).toEqual(expect.arrayContaining(["land", "creature"]));
      expect(subtypes(game, id)).toContain("Elemental");
      expect(pt(game, id)).toEqual({ power: 4, toughness: 4 });
      expect(keywords(game, id).has("trample")).toBe(true);
    }
    expect(types(game, old)).not.toContain("creature");
    game.advanceUntil((s) => s.turn.number === 2);
    settle(game);
    expect(types(game, picked[0])).toContain("creature");
  });

  it("+1: untaps up to four target Forests", () => {
    const { game } = table();
    const forests = [0, 1, 2, 3].map(() => spawn(game, "Forest", A, { tapped: true }));
    const theirs = spawn(game, "Forest", B, { tapped: true });
    const nissa = spawn(game, "Nissa, Worldwaker");
    // Both +1s cost the same, so the untap is named by its index (the second).
    activate(game, nissa, 1, { targets: [ref(forests[0]), ref(forests[1]), ref(forests[2]), ref(theirs)] });
    expect(game.state.objects[nissa].counters.loyalty).toBe(4);
    expect(game.state.objects[forests[0]].tapped).toBe(false);
    expect(game.state.objects[theirs].tapped).toBe(false);
    expect(game.state.objects[forests[3]].tapped).toBe(true);
  });
});

describe("Spirit Bonds", () => {
  it("pays {W} for a Spirit when a nontoken creature enters, and a Spirit sacrifices for indestructible", () => {
    const { game, a } = table();
    spawn(game, "Spirit Bonds");
    lands(game, "Plains", 3);
    pickModes(a, 0);
    const bears = enter(game, "Grizzly Bears");
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
    const [spirit] = named(game, "Spirit Token", A);
    const bonds = named(game, "Spirit Bonds", A)[0];
    game.dispatch({ type: "activate-ability", player: A, source: bonds, abilityIndex: 0, targets: [ref(bears)], sacrifice: spirit });
    settle(game);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(0);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
  });
});

describe("Burning Anger", () => {
  it("gives the enchanted creature a tap ability dealing its power in damage", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Burning Anger"), { targets: [ref(giant)] });
    activate(game, giant, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(game.state.objects[giant].tapped).toBe(true);
  });
});

describe("Ensoul Artifact", () => {
  it("makes the enchanted artifact a 5/5 artifact creature", () => {
    const { game } = table();
    const rock = spawn(game, "Mind Stone");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Ensoul Artifact"), { targets: [ref(rock)] });
    expect(types(game, rock)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, rock)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Paragon of Open Graves", () => {
  it("pumps other black creatures you control, not itself or others", () => {
    const { game } = table();
    const paragon = spawn(game, "Paragon of Open Graves");
    const zombie = spawn(game, "Walking Corpse");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Walking Corpse", B);
    expect(pt(game, paragon)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, zombie)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Blood Host", () => {
  it("sacrifices another creature for a +1/+1 counter and 2 life", () => {
    const { game } = table();
    const host = spawn(game, "Blood Host");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    game.dispatch({ type: "activate-ability", player: A, source: host, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, host)).toBe(1);
    expect(life(game, A)).toBe(22);
  });
});

describe("Tyrant's Choice", () => {
  it("a tie is torture: each opponent loses 4 life", () => {
    const { game, a, b } = table();
    pickModes(a, 0);
    pickModes(b, 1);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Tyrant's Choice"));
    expect(life(game, B)).toBe(16);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("death outright: each opponent sacrifices a creature", () => {
    const { game, a, b } = table();
    pickModes(a, 0);
    pickModes(b, 0);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Tyrant's Choice"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Predator's Howl", () => {
  it("makes one Wolf, or three if a creature died this turn", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    cast(game, toHand(game, "Predator's Howl"));
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    cast(game, toHand(game, "Predator's Howl"));
    expect(tokensNamed(game, "Wolf Token", A)).toBe(4);
  });
});

describe("Statute of Denial", () => {
  it("counters, then loots only with a blue creature", () => {
    for (const blue of [true, false]) {
      const { game } = table();
      if (blue) spawn(game, "Coral Merfolk");
      lands(game, "Island", 4);
      lands(game, "Mountain", 1);
      const shock = toHand(game, "Shock");
      const statute = toHand(game, "Statute of Denial");
      cast(game, shock, { targets: [ref(B)], settle: false });
      const handBefore = game.state.zones.perPlayer[A].hand.length;
      cast(game, statute, { targets: [ref(shock)] });
      expect(zone(game, shock)).toBe("graveyard");
      expect(life(game, B)).toBe(20);
      // Statute left the hand; with a blue creature, a card was drawn and one discarded.
      expect(game.state.zones.perPlayer[A].hand.length).toBe(handBefore - 1);
      expect(game.state.zones.perPlayer[A].graveyard.length).toBe(blue ? 3 : 2);
    }
  });
});
