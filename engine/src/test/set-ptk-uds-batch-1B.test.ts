import { describe, expect, it } from "vitest";
import {
  A,
  B,
  blockOffer,
  cast,
  destroy,
  graveyard,
  hand,
  life,
  named,
  nextTurn,
  pickModes,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("PTK / UDS batch 1 group B", () => {
  it("Zodiac Dragon: put into its owner's graveyard, it may return to hand", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Zodiac Dragon");
    pickModes(a, 0);
    destroy(game, dragon);
    expect(hand(game, A).some((id) => game.state.objects[id].cardName === "Zodiac Dragon")).toBe(true);
    expect(graveyard(game, A).some((id) => game.state.objects[id].cardName === "Zodiac Dragon")).toBe(false);
  });

  it("Gamekeeper: exiled as it dies, reveals to a creature card, the rest to the graveyard", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    const keeper = spawn(game, "Gamekeeper");
    const graveBefore = graveyard(game, A).length;
    pickModes(a, 0);
    destroy(game, keeper);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    expect(game.state.zones.shared.exile.some((id) => game.state.objects[id].cardName === "Gamekeeper")).toBe(true);
    // The two Wastes revealed above the Bears; Gamekeeper itself went on to exile.
    expect(graveyard(game, A).length - graveBefore).toBe(2);
  });

  it("Gamekeeper: declining the exile reveals nothing", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears");
    const keeper = spawn(game, "Gamekeeper");
    pickModes(a);
    destroy(game, keeper);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
    expect(zone(game, keeper)).not.toBe("battlefield");
  });

  it("Impatience: 2 damage to the player whose end step it is only if they cast no spell", () => {
    const { game } = table();
    spawn(game, "Impatience");
    const thopter = toHand(game, "Ornithopter");
    cast(game, thopter);
    nextTurn(game); // alice's end step passes: she cast a spell
    expect(life(game, A)).toBe(20);
    nextTurn(game); // bob's end step: he cast nothing
    expect(life(game, B)).toBe(18);
    nextTurn(game); // alice's second turn: nothing cast
    expect(life(game, A)).toBe(18);
  });

  it("Taoist Mystic: creatures with horsemanship can't block it", () => {
    const { game, a } = table();
    const mystic = spawn(game, "Taoist Mystic");
    const rider = spawn(game, "Shu Elite Companions", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [mystic]);
    expect(offer.eligible.find((e) => e.blocker === rider)?.canBlock ?? []).not.toContain(mystic);
    expect(offer.eligible.find((e) => e.blocker === bears)?.canBlock ?? []).toContain(mystic);
  });
});
