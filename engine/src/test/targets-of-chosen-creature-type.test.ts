/**
 * "…target creature cards **of the creature type of your choice**" — a
 * target group's `oneCreatureType` (Aphetto Dredging, Selective Snare). The
 * type is chosen as the spell is cast, before its targets (the rulings, rule
 * 601.2c): the members share it, and it becomes the spell's chosen creature
 * type — at once when they share one, else asked among those they share. As
 * it resolves, a member no longer of that type is illegal (608.2b).
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { slotOptions } from "../target.js";
import { stateTargetFacts } from "../targeting.js";
import { B, activate, cast, lands, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const refs = (...ids: ObjectId[]) => ids.map((id) => ref(id));

describe("targets of the creature type of your choice — Aphetto Dredging", () => {
  it("returns creature cards that share a type, the caster choosing among the types they share", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const elf = toGraveyard(game, "Llanowar Elves");
    const mystic = toGraveyard(game, "Elvish Mystic");
    const asked: (readonly string[])[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      asked.push(options);
      return "Elf";
    };
    const dredging = toHand(game, "Aphetto Dredging");
    cast(game, dredging, { targets: refs(elf, mystic), settle: false });
    game.advanceUntil((s) => s.awaiting === null || s.awaiting.kind !== "choose-creature-type");
    expect(game.state.objects[dredging].chosenCreatureType).toBe("Elf");
    // Both are Elf Druids: the caster picked between the two.
    expect([...(asked[0] ?? [])].sort()).toEqual(["Druid", "Elf"]);
    settle(game);
    expect(zone(game, elf)).toBe("hand");
    expect(zone(game, mystic)).toBe("hand");
  });

  it("refuses targets that share no creature type", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const elf = toGraveyard(game, "Llanowar Elves");
    const bears = toGraveyard(game, "Grizzly Bears");
    const dredging = toHand(game, "Aphetto Dredging");
    expect(() => cast(game, dredging, { targets: refs(elf, bears) })).toThrow(/creature type in common/);
    expect(zone(game, dredging)).toBe("hand");
  });

  it("one target of one type: that type, nothing asked; none at all is fine", () => {
    const { game, a } = table();
    lands(game, "Swamp", 8);
    const bears = toGraveyard(game, "Grizzly Bears");
    let asked = false;
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      asked = true;
      return options[0];
    };
    const dredging = toHand(game, "Aphetto Dredging");
    cast(game, dredging, { targets: refs(bears), settle: false });
    expect(game.state.objects[dredging].chosenCreatureType).toBe("Bear");
    settle(game);
    expect(asked).toBe(false);
    expect(zone(game, bears)).toBe("hand");
    const again = toHand(game, "Aphetto Dredging");
    cast(game, again, { targets: [] });
    expect(zone(game, again)).toBe("graveyard");
  });

  it("offers as a second target only a card sharing a type with the first", () => {
    const { game } = table();
    const elf = toGraveyard(game, "Llanowar Elves");
    const mystic = toGraveyard(game, "Elvish Mystic");
    const bears = toGraveyard(game, "Grizzly Bears");
    const specs = game.registry.get("Aphetto Dredging").targets;
    const all = [elf, mystic, bears].map((id) => ref(id));
    const facts = stateTargetFacts(game.state, game.registry);
    const second = slotOptions(specs, [all], 1, [ref(elf)], facts).map((r) => (r.kind === "object" ? r.object : null));
    expect(second).toContain(mystic);
    expect(second).not.toContain(bears);
  });
});

describe("targets of the creature type of your choice — Selective Snare", () => {
  it("returns X creatures of one type, whoever controls them", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const mine = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Elvish Mystic", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const snare = toHand(game, "Selective Snare");
    cast(game, snare, { x: 2, targets: refs(mine, theirs) });
    expect(zone(game, mine)).toBe("hand");
    expect(zone(game, theirs)).toBe("hand");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("a target no longer of the chosen type as it resolves is illegal, though it shares another with the rest", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const crafter = spawn(game, "Imagecrafter");
    const mine = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Elvish Mystic", B);
    const answers = ["Elf", "Druid"];
    a.chooseCreatureTypeFn = () => answers.shift() ?? "Elf";
    const snare = toHand(game, "Selective Snare");
    cast(game, snare, { x: 2, targets: refs(mine, theirs), settle: false });
    game.advanceUntil((s) => s.awaiting === null || s.awaiting.kind !== "choose-creature-type");
    expect(game.state.objects[snare].chosenCreatureType).toBe("Elf");
    // In response the Mystic becomes a Druid alone: still sharing Druid with
    // the Elves, but no longer an Elf.
    activate(game, crafter, 0, { targets: refs(theirs) });
    expect(zone(game, mine)).toBe("hand");
    expect(zone(game, theirs)).toBe("battlefield");
  });
});
