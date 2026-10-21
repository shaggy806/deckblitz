/**
 * Set walk: Ikoria: Lair of Behemoths (IKO), group c.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("General Kudro of Drannith", () => {
  it("pumps other Humans, exiles from an opponent's graveyard as a Human enters, and sacrifices two Humans to destroy", () => {
    const { game, a } = table();
    const kudro = spawn(game, "General Kudro of Drannith");
    const otter = spawn(game, "Thieving Otter");
    expect(pt(game, kudro)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, otter)).toEqual({ power: 2, toughness: 2 });

    const theirs = toGraveyard(game, "Wastes", B);
    pickTargets(a, theirs);
    const squad = enter(game, "Whisper Squad");
    expect(zone(game, theirs)).toBe("exile");
    expect(pt(game, squad)).toEqual({ power: 2, toughness: 2 });

    const smasher = spawn(game, "Sanctuary Smasher", B);
    lands(game, "Wastes", 2);
    pickPermanents(a, kudro, squad);
    activate(game, kudro, 0, { targets: [ref(smasher)] });
    expect(zone(game, smasher)).toBe("graveyard");
    expect(zone(game, kudro)).toBe("graveyard");
    expect(zone(game, squad)).toBe("graveyard");
    expect(zone(game, otter)).toBe("battlefield");
  });
});

describe("Grimdancer", () => {
  it("enters with both counters of the chosen pair", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    a.chooseCreatureTypeFn = () => "deathtouch and lifelink";
    const dancer = toHand(game, "Grimdancer");
    cast(game, dancer);
    expect(zone(game, dancer)).toBe("battlefield");
    expect(counters(game, dancer, "deathtouch")).toBe(1);
    expect(counters(game, dancer, "lifelink")).toBe(1);
    expect(counters(game, dancer, "menace")).toBe(0);
    expect(keywords(game, dancer).has("deathtouch")).toBe(true);
    expect(keywords(game, dancer).has("lifelink")).toBe(true);
    expect(keywords(game, dancer).has("menace")).toBe(false);
  });
});

describe("Death's Oasis", () => {
  it("mills two, then returns a creature card of lesser mana value than the one that died", () => {
    const { game, a } = table();
    spawn(game, "Death's Oasis");
    const coilbug = toGraveyard(game, "Durable Coilbug"); // MV 2
    const dancer = toGraveyard(game, "Grimdancer"); // MV 3
    const mentor = spawn(game, "Wingspan Mentor"); // MV 3
    let eligible: readonly ObjectId[] = [];
    // Prefers anything but the Coilbug, so a filter letting a mana value 3
    // card through would return it instead.
    a.chooseFromZoneFn = (_view, offered) => {
      eligible = offered;
      return [offered.find((id) => id !== coilbug) ?? offered[0]];
    };
    const libraryBefore = game.state.zones.perPlayer[A].library.length;
    destroy(game, mentor);
    expect(game.state.zones.perPlayer[A].library.length).toBe(libraryBefore - 2);
    expect(zone(game, coilbug)).toBe("hand");
    expect(zone(game, dancer)).toBe("graveyard");
    expect(zone(game, mentor)).toBe("graveyard");
    expect(eligible).not.toContain(dancer);
    expect(eligible).not.toContain(mentor);
  });

  it("sacrifices to gain life equal to the greatest mana value among your creatures", () => {
    const { game } = table();
    const oasis = spawn(game, "Death's Oasis");
    spawn(game, "Sanctuary Smasher"); // MV 6
    spawn(game, "Durable Coilbug"); // MV 2
    spawn(game, "Sanctuary Smasher", B); // an opponent's doesn't count — still 6
    lands(game, "Wastes", 1);
    activate(game, oasis, 0);
    expect(zone(game, oasis)).toBe("graveyard");
    expect(life(game)).toBe(26);
  });
});

describe("Momentum Rumbler", () => {
  it("gets a first strike counter on its first attack, and double strike on the next", () => {
    const { game, a } = table();
    const rumbler = spawn(game, "Momentum Rumbler");
    attack(game, a, [rumbler]);
    expect(counters(game, rumbler, "first-strike")).toBe(1);
    expect(life(game, B)).toBe(17);
    expect(keywords(game, rumbler).has("double-strike")).toBe(false);

    toStep(game, "precombat-main");
    attack(game, a, [rumbler]);
    expect(counters(game, rumbler, "first-strike")).toBe(1);
    expect(life(game, B)).toBe(11);
  });
});

describe("Forbidden Friendship", () => {
  it("makes a hasty red Dinosaur and a Human Soldier", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Forbidden Friendship"));
    expect(tokensNamed(game, "1/1 Red Dinosaur Token (Haste)", A)).toBe(1);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(1);
  });
});

describe("Sudden Spinnerets", () => {
  it("pumps, puts a reach counter on and untaps the creature", () => {
    const { game, a } = table();
    const otter = spawn(game, "Thieving Otter", A, { tapped: true });
    lands(game, "Forest", 1);
    pickTargets(a, otter);
    cast(game, toHand(game, "Sudden Spinnerets"), { targets: [ref(otter)] });
    expect(game.state.objects[otter].tapped).toBe(false);
    expect(counters(game, otter, "reach")).toBe(1);
    expect(keywords(game, otter).has("reach")).toBe(true);
    expect(pt(game, otter)).toEqual({ power: 3, toughness: 5 });
  });
});

describe("Duskfang Mentor", () => {
  it("gives a non-Human creature you control a lifelink counter, then grows each lifelinker", () => {
    const { game, a } = table();
    const otter = spawn(game, "Thieving Otter");
    const squad = spawn(game, "Whisper Squad");
    const bug = spawn(game, "Durable Coilbug");
    const theirs = spawn(game, "Durable Coilbug", B);
    const seen = watchTargets(a, (offered) => offered.map(() => otter));
    const mentor = enter(game, "Duskfang Mentor");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(otter);
    expect(seen.offered[0]).toContain(bug);
    expect(seen.offered[0]).not.toContain(squad);
    expect(seen.offered[0]).not.toContain(mentor);
    expect(seen.offered[0]).not.toContain(theirs);
    expect(counters(game, otter, "lifelink")).toBe(1);

    lands(game, "Swamp", 2);
    const handBefore = hand(game).length;
    activate(game, mentor, 0);
    expect(counters(game, otter)).toBe(1);
    expect(counters(game, squad)).toBe(0);
    expect(counters(game, bug)).toBe(0);
    expect(hand(game).length).toBe(handBefore);
  });
});
