/**
 * "This effect doesn't remove Auras and Equipment you control that are already
 * attached to it" (`protection.doesntRemoveAttached`, rule 702.16p —
 * Benevolent Blessing): what its controller had on the creature when the
 * protection began stays, itself included; an opponent's Aura, and anything
 * attached afterwards, falls off (702.16c-d); another instance of the same
 * protection removes them as normal. Beside it, "doesn't remove Auras"
 * (702.16n — Spectra Ward) still lets an Equipment fall off.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../index.js";
import { A, B, cast, lands, named, ref, spawn, table, toHand, zone } from "./harness.js";

const on = (game: Game, name: string, host: ObjectId, player: PlayerId = A): ObjectId => {
  const attachment = spawn(game, name, player);
  game.state.objects[attachment].attachedTo = host;
  return attachment;
};

/** An effect attaches `attachment` to `host`, if it can be (rule 701.3b). */
const move = (game: Game, attachment: ObjectId, host: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(host), ref(attachment)]);
};

/** State-based actions are checked: any spell resolving does it. */
const check = (game: Game): void => {
  lands(game, "Forest", 1);
  cast(game, toHand(game, "Giant Growth"), { targets: [ref(spawn(game, "Savannah Lions"))] });
};

const bless = (t: ReturnType<typeof table>, host: ObjectId, color: string): ObjectId => {
  lands(t.game, "Plains", 2);
  t.a.chooseCreatureTypeFn = () => color;
  cast(t.game, toHand(t.game, "Benevolent Blessing"), { targets: [ref(host)] });
  return named(t.game, "Benevolent Blessing")[0];
};

describe("Benevolent Blessing", () => {
  it("keeps your Auras and Equipment already attached, itself too; an opponent's Aura falls off", () => {
    const t = table();
    const { game } = t;
    const bears = spawn(game, "Grizzly Bears");
    const strength = on(game, "Holy Strength", bears);
    const maul = on(game, "Maul of the Skyclaves", bears);
    const pacifism = on(game, "Pacifism", bears, B);
    const blue = on(game, "Claustrophobia", bears, B);
    const blessing = bless(t, bears, "W");
    expect(game.state.objects[blessing].attachedTo).toBe(bears);
    expect(game.state.objects[strength].attachedTo).toBe(bears);
    expect(game.state.objects[maul].attachedTo).toBe(bears);
    expect(zone(game, pacifism)).toBe("graveyard");
    expect(zone(game, blue)).toBe("battlefield");
  });

  it("doesn't spare what becomes attached afterwards, or what was moved off and back", () => {
    const t = table();
    const { game } = t;
    const bears = spawn(game, "Grizzly Bears");
    const maul = on(game, "Maul of the Skyclaves", bears);
    bless(t, bears, "W");
    // A white Equipment can't be moved onto it now (rule 702.16d).
    const late = spawn(game, "Maul of the Skyclaves");
    move(game, late, bears);
    expect(game.state.objects[late].attachedTo ?? null).toBeNull();
    // Already on it when the effect began, found there later: it falls off.
    const strength = on(game, "Holy Strength", bears);
    // The first Maul, moved to another creature and back, isn't "already attached" any more.
    const lions = spawn(game, "Savannah Lions");
    move(game, maul, lions);
    expect(game.state.objects[maul].attachedTo).toBe(lions);
    move(game, maul, bears);
    expect(game.state.objects[maul].attachedTo).toBe(lions);
    check(game);
    expect(zone(game, strength)).toBe("graveyard");
  });

  it("another instance of the same protection removes them as normal", () => {
    const t = table();
    const { game } = t;
    const bears = spawn(game, "Grizzly Bears");
    const strength = on(game, "Holy Strength", bears);
    const maul = on(game, "Maul of the Skyclaves", bears);
    const blessing = bless(t, bears, "W");
    // White Ward spares only itself; the Blessing doesn't spare the Ward, attached later.
    const ward = on(game, "White Ward", bears);
    check(game);
    expect(zone(game, strength)).toBe("graveyard");
    expect(zone(game, blessing)).toBe("graveyard");
    expect(zone(game, ward)).toBe("graveyard");
    expect(zone(game, maul)).toBe("battlefield");
    expect(game.state.objects[maul].attachedTo ?? null).toBeNull();
  });

  it("naming another colour leaves everything on", () => {
    const t = table();
    const { game } = t;
    const bears = spawn(game, "Grizzly Bears");
    const pacifism = on(game, "Pacifism", bears, B);
    const blessing = bless(t, bears, "R");
    expect(zone(game, pacifism)).toBe("battlefield");
    expect(game.state.objects[blessing].attachedTo).toBe(bears);
  });
});

describe("Spectra Ward", () => {
  it("doesn't remove Auras, but a coloured Equipment still becomes unattached", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const strength = on(game, "Holy Strength", bears);
    const maul = on(game, "Maul of the Skyclaves", bears);
    const ward = on(game, "Spectra Ward", bears);
    check(game);
    expect(game.state.objects[strength].attachedTo).toBe(bears);
    expect(game.state.objects[ward].attachedTo).toBe(bears);
    expect(game.state.objects[maul].attachedTo ?? null).toBeNull();
  });
});
