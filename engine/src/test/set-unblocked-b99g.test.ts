/**
 * Unblocked older cards, B99 group g (2026-10-17): cards a feature built in
 * the last two batches unblocked — backup, Sieges, toxic filters, distributed
 * counters. Each test written from the card's Oracle text and rulings, on the
 * shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  quiet,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  types,
  watchTargets,
  zone,
} from "./harness.js";

/** Answer each target choice with the first of `ids` its first slot offers. */
function pickOffered(seat: ScriptedController, ...ids: readonly ObjectId[]): void {
  seat.chooseTargetsFn = (_view, _source, _specs, legal) => {
    const slot = legal[0] ?? [];
    const hit = ids.find((id) => slot.some((t) => t.kind === "object" && t.object === id));
    return hit === undefined ? [] : [ref(hit)];
  };
}

describe("Archpriest of Shadows", () => {
  it("backup gives another creature deathtouch and the reanimating combat-damage trigger", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const dead = toGraveyard(game, "Craw Wurm");
    pickOffered(a, bears, dead);
    enter(game, "Archpriest of Shadows");
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    attack(game, a, [bears]);
    expect(zone(game, dead)).toBe("battlefield");
  });
});

describe("Emergent Woodwurm", () => {
  it("attacking, looks at the top X (its power) and may put a permanent card of mana value X or less — a land too — onto the battlefield", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Emergent Woodwurm");
    // Top four, bottom to top: past the fourth is out of reach.
    const deep = toLibrary(game, "Grizzly Bears");
    const big = toLibrary(game, "Craw Wurm");
    const forest = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    const hill = toLibrary(game, "Hill Giant");
    const seen = pickFromZone(a, hill);
    attack(game, a, [wurm]);
    expect(seen.offered).toEqual(expect.arrayContaining([forest, bears, hill]));
    expect(seen.offered).not.toContain(big);
    expect(seen.offered).not.toContain(deep);
    expect(zone(game, hill)).toBe("battlefield");
  });
});

describe("Guardian Scalelord", () => {
  it("attacking, returns a nonland permanent card with mana value up to its power", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Guardian Scalelord");
    const giant = toGraveyard(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    const wurm = toGraveyard(game, "Craw Wurm");
    const forest = toGraveyard(game, "Forest");
    // Power 3: Hill Giant (mana value 4) is out of reach, so the Bears are
    // the only choice.
    attack(game, a, [dragon]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");

    // With a +1/+1 counter it's power 4: X is its power now.
    game.state.objects[dragon].counters["+1/+1"] = 1;
    nextTurn(game);
    nextTurn(game);
    const seen = watchTargets(a, () => [giant]);
    toGraveyard(game, "Grizzly Bears");
    attack(game, a, [dragon]);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(giant);
    expect(seen.offered[0]).not.toContain(wurm);
    expect(seen.offered[0]).not.toContain(forest);
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Invasion of Zendikar // Awakened Skyclave", () => {
  it("fetches two basics tapped; defeated, Awakened Skyclave is a land creature that taps for mana", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const library = game.state.zones.perPlayer[A].library;
    const wanted = [library[0], library[1]];
    pickFromZone(a, ...wanted);
    const battle = toHand(game, "Invasion of Zendikar");
    cast(game, battle);
    for (const id of wanted) {
      expect(zone(game, id)).toBe("battlefield");
      expect(game.state.objects[id].tapped).toBe(true);
    }
    expect(counters(game, battle, "defense")).toBe(3);

    const giant = spawn(game, "Craw Wurm");
    pickModes(a, 0);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0];
      if (way === undefined) return null;
      return {
        type: "cast-spell",
        player: A,
        card: way.card,
        targets: [],
        via: way.via,
        ...(way.face !== undefined ? { face: way.face } : {}),
        ...(offer.free ? { free: true } : {}),
      };
    };
    a.declareAttackersFn = () => [{ attacker: giant, defender: battle }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zone(game, battle)).toBe("battlefield");
    expect(printedCardName(game.state.objects[battle])).toBe("Awakened Skyclave");
    expect(types(game, battle)).toEqual(expect.arrayContaining(["creature", "land"]));
    expect(keywords(game, battle).has("haste")).toBe(true);
    activate(game, battle, 0);
    expect(game.state.objects[battle].tapped).toBe(true);
  });
});

describe("Necrogen Rotpriest", () => {
  it("a creature with toxic deals combat damage: its toxic plus one more poison counter; one without toxic gives none", () => {
    const { game, a } = table();
    spawn(game, "Necrogen Rotpriest");
    const nurse = spawn(game, "Plague Nurse");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [nurse, bears]);
    // Plague Nurse's toxic 2, and the Rotpriest's additional counter.
    expect(game.state.players[B].counters.poison).toBe(3);
  });

  it("grants deathtouch only to a creature you control with toxic", () => {
    const { game } = table();
    const priest = spawn(game, "Necrogen Rotpriest");
    const nurse = spawn(game, "Plague Nurse");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    lands(game, "Forest", 3);
    expect(() => activate(game, priest, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, priest, 0, { targets: [ref(nurse)] });
    expect(keywords(game, nurse).has("deathtouch")).toBe(true);
  });
});

describe("Jade Seedstones // Jadeheart Attendant", () => {
  it("distributes three +1/+1 counters as chosen; crafted, gains life equal to the exiled card's mana value", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const stones = enter(game, "Jade Seedstones", A, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets" || quiet(s));
    expect(game.state.awaiting?.kind).toBe("choose-targets");
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(bears), ref(giant)], division: [1, 2] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, giant)).toBe(2);

    toStep(game, "postcombat-main");
    lands(game, "Forest", 7);
    const wurm = toGraveyard(game, "Craw Wurm");
    pickFromZone(a, wurm);
    const before = life(game, A);
    activate(game, stones, 0);
    expect(zone(game, wurm)).toBe("exile");
    expect(printedCardName(game.state.objects[stones])).toBe("Jadeheart Attendant");
    expect(life(game, A)).toBe(before + 6);
  });
});
